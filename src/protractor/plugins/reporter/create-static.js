const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

let template = fs.readFileSync(path.resolve(__dirname, 'templates/main.handlebars'), {
  encoding: 'utf8',
});
template = Handlebars.compile(template);

function getDurationObj(durationInMilliseconds) {
  const dur = moment.duration(durationInMilliseconds, 'ms');
  return {
    duration: dur,
    hrs: dur.get('h'),
    min: dur.get('m'),
    sec: dur.get('s'),
    ms: dur.get('ms'),
  };
}

Handlebars.registerHelper('addLocalCSS', cssPath => (fs.readFileSync(path.resolve(__dirname, cssPath), {
  encoding: 'utf8',
})));

Handlebars.registerHelper('formatSummaryDuration', (context) => {
  const dur = getDurationObj(context);
  if (dur.hrs < 1) {
    if (dur.min < 1) {
      if (dur.sec < 1) {
        return context;
      }
      return `${dur.sec}.${dur.ms}`;
    }
    return `${dur.min}:${dur.sec < 10 ? (`0${dur.sec}`) : dur.sec}`;
  }
  return `${dur.hrs}:${dur.min < 10 ? (`0${dur.min}`) : dur.min}`;
});

Handlebars.registerHelper('getSummaryDurationUnits', (context) => {
  const dur = getDurationObj(context);
  if (dur.hrs < 1) {
    if (dur.min < 1) {
      if (dur.sec < 1) {
        return 'ms';
      }
      return 's';
    }
    return 'm';
  }
  return 'h';
});

Handlebars.registerHelper('formatDuration', (context) => {
  const dur = getDurationObj(context);
  if (dur.hrs < 1) {
    if (dur.min < 1) {
      if (dur.sec < 1) {
        return `${context} ms`;
      }
      return `${dur.sec}.${dur.ms} s`;
    }
    return `${dur.min}:${dur.sec < 10 ? (`0${dur.sec}`) : dur.sec}.${dur.ms} m`;
  }
  return `${dur.hrs}:${dur.min < 10 ? (`0${dur.min}`) : dur.min}:${dur.sec < 10 ? (`0${dur.sec}`) : dur.sec}.${dur.ms} h`;
});

Handlebars.registerHelper('dateFormat', (context, format) =>
  moment(context).format(format));

const report = {
  generate(jsonFileName) {
    return new Promise((resolve) => {
      const data = JSON.parse(fs.readFileSync(jsonFileName), {
        encoding: 'utf8',
      });
      const filename = jsonFileName.replace('.json', '.html');
      const html = template(data);
      fs.writeFileSync(path.resolve(__dirname, filename), html);
      resolve();
    });
  },
};

module.exports = report;
