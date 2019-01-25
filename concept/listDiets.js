const listDiets = notes => {
  notes.forEach(note => {
    if (!DIETS[note]) {
      DIETS[note] = true;
    }
  });
};

const indexNotes = menus => {
  // These menus are keyed by dates;
  var dates = Object.keys(menus);
  dates.forEach(date => {
    var dayMenu = menus[date];
    dayMenu.forEach(menuItem => {
      var notes = menuItem.notes || [];
      listDiets(notes);
    });
  });
};
