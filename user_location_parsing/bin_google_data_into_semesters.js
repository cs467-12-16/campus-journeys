// Create bins of years and semesters for peoples' google history 
// based on timestamps and their current year
// 0 = freshman fall, 1 = freshman spring, 2 = soph fall...

// takes in already merged_user_data.json and creates the bins 

import { readFile, writeFile } from 'fs'
import async from 'async'
import moment from 'moment'


const filepath = './data/glh_parsed/merged_user_data.json'
const writepath = './data/glh_parsed/merged_user_data_binned.json'
createBins(filepath, writepath)


function read(file, callback) {
  readFile(file, 'utf8', callback)
}

function write(file, data, callback) {
  writeFile(file, JSON.stringify(data), callback)
}

function createBins(filepath, writepath) {
  read(filepath, (err, result) => {
    if (err) throw err
    result = JSON.parse(result)

    const newData = result.filter(u => u)
      .map(userData => {
        const { year, googleLocationData } = userData
        // console.log('year', year)

        let semesterBins = {}
        for (let i of range(0, 8)) {
          semesterBins[i] = []
        }

        const sample = googleLocationData.slice(0, 10)

        // sample.forEach(point => {
        googleLocationData.forEach(point => {
          let { timestamp } = point
          timestamp = parseInt(timestamp)

          const bin = getBin(timestamp, year)
          if (range(0, 8).includes(bin)) {
            semesterBins[bin].push(point)
          }
        })

        let retData = {}
        for (let key in userData) {
          if (key !== 'googleLocationData') {
            retData[key] = userData[key]
          }
        }
        retData.semesterBins = semesterBins

        return retData
      })

    write(writepath, newData, err => {
      if (err) throw err
      console.log('binned data written!')
    })

  })
}

// userClass is the student's current year
function getBin(timestamp, userClass) {
  let bin = -1
  const m = moment(timestamp)

  if (m.isBetween('2016-01-15', '2016-05-20')) {
    bin = 7
  } else if (m.isBetween('2015-08-01', '2015-12-20')) {
    bin = 6
  } else if (m.isBetween('2015-01-15', '2015-05-20')) {
    bin = 5
  } else if (m.isBetween('2014-08-01', '2014-12-20')) {
    bin = 4
  } else if (m.isBetween('2014-01-15', '2014-05-20')) {
    bin = 3
  } else if (m.isBetween('2013-08-01', '2013-12-20')) {
    bin = 2
  } else if (m.isBetween('2013-01-15', '2013-05-20')) {
    bin = 1
  } else if (m.isBetween('2012-08-01', '2012-12-20')) {
    bin = 0
  }

  if (userClass === 'junior') {
    bin -= 2
  } else if (userClass === 'sophomore') {
    bin -= 4
  } else if (userClass === 'freshman') {
    bin -= 6
  }

  return bin
}

function range(start, end) {
  return Array.apply(0, Array(end)).map((element, index) => index + start)
}

// TODO: filter out locations not around uiuc?