import { readdir, readFile, writeFile } from 'fs'
import async from 'async'

let mergedUserData = []
readFilesFromDirectory('./data/glh_parsed/', handleAllFiles)

function read(file, callback) {
  readFile(file, 'utf8', callback)
}

function write(file, data, callback) {
  writeFile(file, JSON.stringify(data), callback)
}

function readFilesFromDirectory(directory, callback) {
  readdir(directory, (err, filenames) => {
    if (err) throw err
    filenames = filenames.map(file => directory + file)
    callback(filenames)
  })
}

function handleAllFiles(filenames) {
  async.each(filenames, handleFile, (err) => {
    if (err) throw err
    else {
      write('./data/glh_parsed/merged_user_data.json', mergedUserData, err => {
        if (err) throw err
        console.log('mergedUserData successfully written!')
      })
    }
  })
}

function handleFile(file, callback) {
  read(file, (err, res) => {
    if (err) throw err
    res = JSON.parse(res)

    const needToTrim = './data/glh_parsed/out-'
    const user = file.slice(file.indexOf(needToTrim) + needToTrim.length, file.indexOf('.json'))

    const userDataFilepath = './data/cs467group12map-export.json'

    read(userDataFilepath, (err, result) => {
      result = JSON.parse(result).data
      let userData = result[user]
      if (userData) {
        userData.googleLocationData = res
      }
      mergedUserData.push(userData)
      callback(null)
    })
  })
}
