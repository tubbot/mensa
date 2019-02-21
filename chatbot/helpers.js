const _ = require('lodash');
const moment = require('moment');

const getUserName = ctx => {
  if (!ctx.from) {
    return '';
  }
  return ctx.from.first_name || ctx.from.username || 'User';
};

const getMensaId = entities => {
  return Number(_.get(entities, 'mensa_name.stringValue'));
};

const getDate = entities => {
  var dateString = _.get(entities, 'date.stringValue');
  var userDate = dateString ? moment(dateString).format('YYYY-MM-DD') : null;
  return userDate;
};

const getDiet = entities => {
  return _.get(entities, 'diet_type.stringValue');
};

const helpers = {
  getUserName: getUserName,
  getMensaId: getMensaId,
  getDate: getDate,
  getDiet: getDiet
};

module.exports = helpers;
