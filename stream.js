const { spawn } = require('child_process');
const request = require('request');
const fs = require('fs');
const wake = require('./wake');

const state = {};
const streamDir = __dirname + '/static/stream';
const processes = {};

const protocol = 'http://';
const host = 'sunputer-back:3000';

module.exports.start = async (devid) => {
  if ((state[devid] === 0) || (state[devid] === undefined) || (typeof state[devid] === "string")) {
    try {
      state[devid] = 0;
      const devices = await getDevsState();
      const device = devices.filter((dev) => {
        return dev.devid === devid;
      })[0];
      if (device) {
        if (device.up === null) {
          throw new Error('dev state is null');
        }
        /* включаем устройство, если выключено */
        if (device.up === false) {
          state[devid] = 1;//sleeping
          await wake(devid);//39s+30s+25s=94s
        }
        state[devid] = 2;//waked

        /* делаем фото перед включением видео */
        console.log('waked, try get photo');
        await getPhoto(devid);//7s
        state[devid] = 3;//cam working, photo

        /* запускаем трансляцию на устройстве */
        console.log('photo ok, starting stream');
        await startStreamOnDev(devid);//0.1s
        state[devid] = 4;//dev stream started

        /* запускаем кодирование трансляции в dash */
        console.log('ok, start converter');
        await dashConv.start(devid);//3s
        state[devid] = 5;//conv started
        console.log('converter started');
      } else {
        throw new Error('no dev');
      }
    } catch (err) {
      state[devid] = err.toString();
      console.log(state[devid]);
      //state[devid] = 0;
    }
  }
}

module.exports.state = (devsid) => {
  const result = {};
  for (let devid of devsid) {
    if (state[devid] === undefined) { state[devid] = 0; }
    result[devid] = state[devid];
    if (typeof state[devid] === "string") { state[devid] = 0; }//tempfix
  }
  return result;
}

module.exports.stop = async (devid) => {
  if ((state[devid] > 0) || (typeof state[devid] === "string")) {
    await dashConv.stop(devid);
    try {
      await stopStreamOnDev(devid);
    } catch (e) { console.log(e.message) }
    state[devid] = 0;
  }
}

const getDevsState = () => {
  return new Promise((resolve, reject) => {
    request(`${protocol}${host}/state`, (error, resp, body) => {
      if (resp && resp.statusCode === 200) {
        const devices = [];
        try {
          devices.push(...JSON.parse(body));
        } catch(e) {}
        resolve(devices);
      } else {
        console.log(error);
        reject(new Error('no valid answer'));
      }
    });
  });
}

const getPhoto = (deviceID) => {
  return new Promise((resolve, reject) => {
    request(`${protocol}${host}/${deviceID}/photo`, {encoding: 'binary'}, (error, resp, body) => {
      if (resp.headers['content-type'] === 'image/jpeg') {
        fs.writeFile(`${__dirname}/static/photos/beforeStream${deviceID}.jpg`, body, 'binary', (err) => {
          //if (err && err.code === 'ENOENT') { }
          resolve();
        });
      } else {
        reject(JSON.parse(body).error.text);
      }
    });
  });
}

const startStreamOnDev = (devid) => {
  return new Promise((resolve, reject) => {
    request(`${protocol}${host}/${devid}/stream/start`, (error, resp, body) => {
      if (JSON.parse(body).ok) {
        resolve();
      } else {
        reject(new Error(`can't start stream on dev ${devid}`));
      }
    });
  });
}

const stopStreamOnDev = (devid) => {
  return new Promise((resolve, reject) => {
    request(`${protocol}${host}/${devid}/stream/stop`, (error, resp, body) => {
      if (JSON.parse(body).ok) {
        resolve();
      } else {
        reject(new Error(`can't stop stream on dev ${devid}`));
      }
    });
  });
}

const dashConv = {
  start: (devid) => {
    return new Promise((resolve, reject) => {
      let procErr;
      const p = spawn('ffmpeg', [
        '-i',
        `rtsp://172.30.0.3${devid}:8554/unicast`,
        //'rtsp://192.168.88.20:8554/unicast',
        '-f',
        'segment',
        '-map',
        '0:0',
        '-vcodec',
        'copy',
        '-reset_timestamps',
        '1',
        '-f',
        'dash',
        'manifest.mpd',
        /*'-strftime',
        '1',
        '-vf',
        'fps=1/600',
        `../../photos/${devid}/%F-%H-%M-%S.png`,*/
      ], {
        cwd: `${streamDir}/${devid}`
      });
      p.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });
      p.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
      });
      p.on('error', (err) => {
        procErr = new Error(`Failed to start subprocess ${err}`);
        console.log(procErr.message);
        processes[devid] = null;
      });
      p.on('exit', (code/*, signal*/) => {
        switch(code) {
          case 0:
            procErr = new Error(`stream stopped on ${devid}`); break;
          case 1:
            procErr = new Error(`stream not exist on ${devid}`); break;
          case 255:
            procErr = new Error(`stream from ${devid} killed`); break;
          default:
            procErr = new Error(`conv exit with code ${code}`); break;
        }
        processes[devid] = null;
        state[devid] = 0;
      });
      processes[devid] = p;
      setTimeout(() => {
        console.log('checking');
        if (processes[devid] && !processes[devid].killed) {
          resolve();
        } else {
          reject(procErr);
        }
      }, 2000);
    });
  },
  stop: (devid) => {
    return new Promise((resolve, reject) => {
      if (processes[devid] && !processes[devid].killed) { processes[devid].kill("SIGINT"); }
      processes[devid] = null;
      resolve();
    });
  }
}
