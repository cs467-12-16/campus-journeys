import { readdir, readFile, writeFile } from 'fs'
import async from 'async'

readFilesFromDirectory('./data/google_location_histories/')

function readFilesFromDirectory(directory, callback) {
  readdir(directory, (err, filenames) => {
    if (err) throw err
    filenames = filenames.map(file => directory + file)
    handleAllFiles(filenames)
  })
}

function handleAllFiles(filenames) {
  async.each(filenames, handleFile, err => {
    if (err) throw err
  })
}

function handleFile(file, callback) {
  read(file, (err, result) => {
    if (err) throw err
      
    result = JSON.parse(result)
    result = result.locations.map(loc => ({
      timestamp: loc.timestampMs,
      lat: convertToCoord(loc.latitudeE7),
      lon: convertToCoord(loc.longitudeE7)
    }))

    const reversedFilepath = file.split('').reverse().join('')
    const writepath = './data/glh_parsed/out-' + reversedFilepath.slice(0, reversedFilepath.indexOf('/'))
      .split('').reverse().join('')

    write(writepath, result, err => {
      if (err) throw err
    })
  })
}

function read(file, callback) {
  readFile(file, 'utf8', callback)
}

function write(file, data, callback) {
  writeFile(file, JSON.stringify(data), callback)
}

function convertToCoord(coord) {
  return coord/10000000
}
