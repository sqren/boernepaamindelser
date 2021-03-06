// DO NOT UPDATE THIS FILE DIRECTLY. CLONE OF FILE IN WEB FOLDER

const { map, padStart, flatten } = require('lodash');

const ageGroups = [
  {
    timeAfterBirth: {
      days: 7 * 5
    },
    examination: true,
    vaccination: false,
    title: '5 uger',
    text: () => ''
  },
  {
    timeAfterBirth: {
      months: 3
    },
    examination: false,
    vaccination: true,
    title: '3 måneder',
    text: () => ''
  },
  {
    timeAfterBirth: {
      months: 5
    },
    examination: true,
    vaccination: true,
    title: '5 måneder',
    text: () => ''
  },
  {
    timeAfterBirth: {
      months: 12
    },
    examination: true,
    vaccination: true,
    title: '12 måneder',
    text: () => ''
  },
  {
    timeAfterBirth: {
      months: 15
    },
    examination: true,
    vaccination: true,
    title: '15 måneder',
    text: () => ''
  },
  {
    timeAfterBirth: {
      months: 12 * 2
    },
    examination: true,
    vaccination: false,
    title: '2 år',
    text: () => ''
  },
  {
    timeAfterBirth: {
      months: 12 * 3
    },
    examination: true,
    vaccination: false,
    title: '3 år',
    text: () => ''
  },
  {
    timeAfterBirth: {
      months: 12 * 4
    },
    examination: true,
    vaccination: true,
    title: '4 år',
    text: () => ''
  },
  {
    timeAfterBirth: {
      months: 12 * 5
    },
    examination: true,
    vaccination: true,
    title: '5 år',
    text: () => ''
  },
  {
    timeAfterBirth: {
      months: 12 * 12
    },
    examination: false,
    vaccination: true,
    title: '12 år',
    text: () => ''
  }
];

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}-${padStart(month, 2, 0)}-${padStart(day, 2, 0)}`;
}

function getDate(startDate, timeAfterBirth, IN_FUTURE = false) {
  const { days = 0, months = 0 } = timeAfterBirth;

  const direction = IN_FUTURE ? 1 : -1;
  const date = new Date(startDate);
  date.setDate(date.getDate() + days * direction);
  date.setMonth(date.getMonth() + months * direction);
  return formatDate(date);
}

function formatReminders(snapshotValue) {
  const emailReminders = flatten(
    map(snapshotValue, reminder =>
      map(reminder.emails, email => {
        return Object.assign({}, reminder, { email });
      })
    )
  );
  return emailReminders;
}

function getRemindersByDate(date, adminRef) {
  return adminRef
    .database()
    .ref('/reminders')
    .orderByChild('dateOfBirth')
    .equalTo(date)
    .once('value')
    .then(res => formatReminders(res.val()));
}

function getEmailMessage(recipient, groupId) {
  const { examination, vaccination } = ageGroups[groupId];

  const vaccinationText = vaccination
    ? `have sin ${ageGroups[groupId].title}s vaccination`
    : '';

  const examinationText = examination ? `til børneundersøgelse` : '';
  const textSeparator = examination && vaccination ? ' og ' : '';

  return `Kære forælder,

Dette er en påmindelse om, at dit barn ${
    recipient.name
  } skal ${vaccinationText}${textSeparator}${examinationText} hos jeres læge. Du skal selv huske at bestille tid.
${
  examination
    ? `
Læs mere om børneundersøgelserne på https://www.sundhed.dk/borger/patienthaandbogen/boern/undersoegelser/boerneundersoegelser/`
    : ''
}${
    vaccination
      ? `
Læs mere om det danske vaccinations program på https://sst.dk/da/sygdom-og-behandling/vaccinationer/~/media/811A9F6CD64B4462B6FDFE503787CC71.ashx`
      : ''
  }

Med venlig hilsen
HuskBarnet.dk`;
}

function getEmailSubject(recipient, groupId) {
  const { examination, vaccination } = ageGroups[groupId];

  if (examination && vaccination) {
    return `Påmindelse om vaccination og børneundersøgelse af ${
      recipient.name
    }`;
  } else if (vaccination) {
    return `Påmindelse om vaccination af ${recipient.name}`;
  } else {
    return `Påmindelse om børneundersøgelse af ${recipient.name}`;
  }
}

function formatEmail(recipient, groupId) {
  return {
    subject: getEmailSubject(recipient, groupId),
    email: recipient.email,
    message: getEmailMessage(recipient, groupId)
  };
}

function getEmailsToSend(startDate, adminRef) {
  const promises = ageGroups.map(group => {
    const date = getDate(startDate, group.timeAfterBirth);
    return getRemindersByDate(date, adminRef);
  });
  return Promise.all(promises)
    .then(groups => {
      return flatten(
        groups.map((group, groupId) => {
          return group.map(recipient => formatEmail(recipient, groupId));
        })
      );
    })
    .catch(e => {
      console.log(e);
    });
}

module.exports = {
  getEmailsToSend,
  formatReminders,
  ageGroups,
  getDate
};
