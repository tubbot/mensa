const getUserName = ctx => {
  if (!ctx.from) {
    return '';
  }
  return ctx.from.first_name || ctx.from.username || 'User';
};

const helpers = {
  getUserName: getUserName
};

module.exports = helpers;
