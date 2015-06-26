function Calendar(settings) {
  this.calIsOpen = false;
  this.presetIsOpen = false;
  this.element = null;
  this.earliest = settings ? settings.earliest : new Date('January 1, 1900');
  this.latest = settings ? settings.latest : new Date('December 31, 2900');
  this.start_date = settings ? settings.start : null;
  this.end_date = settings ? settings.end : null;
  this.current_date = null;

  var self = this;

  $('.dr-presets').click(function() {
    self.presetToggle();
  });

  $('.dr-list-item').click(function() {
    var range = $('.dr-item-aside', this).html().split('–');

    self.start_date = new Date(range[0]);
    self.end_date = new Date(range[1]);
    self.calendarSetDates();
    self.presetToggle();
    self.calendarSaveDates();
  });

  $('.dr-date').on({
    'click': function() {
      self.calendarOpen(this);
    },

    'keyup': function(event) {
      if (event.keyCode == 9 && !self.calIsOpen && !self.start_date && !self.end_date)
        self.calendarOpen(this);
    },

    'keydown': function(event) {
      if (event.keyCode == 13) { // Enter
        event.preventDefault();
        self.calendarCheckDates();
        self.calendarSetDates();
        self.calendarClose('force');
        
        if ($(self.element).hasClass('dr-date-start') || 
            $(self.element).hasClass('dr-date-end'))
          self.calendarSaveDates();
      }

      if (event.keyCode == 27) { // ESC
        self.calendarSetDates();
        self.calendarClose('force');
      }

      if (event.keyCode == 9) { // Tab
        if ($(self.element).hasClass('dr-date-start')) {
          event.preventDefault();
          $('.dr-date-end').trigger('click');
        } else if ($(self.element).hasClass('dr-date-end')) {
          event.preventDefault();
          self.calendarCheckDates();
          self.calendarSaveDates();
          self.calendarClose('force');
        } else {
          self.calendarCheckDates();
          self.calendarSetDates();
          self.calendarClose('force');
        }
      }
    }
  });

  $('.dr-month-switcher i').click(function() {
    var m = $('.dr-month-switcher span').html();
    var y = $('.dr-year-switcher span').html();
    var back = moment(new Date(m +' 1, '+ y)).subtract(1, 'month');
    var forward = moment(new Date(m +' 1, '+ y)).add(1, 'month').startOf('day');

    if ($(this).hasClass('icon-left')) {  
      $(this).parent().find('span').html(back.format('MMMM'));
      self.calendarOpen(self.element, back);
    } else if ($(this).hasClass('icon-right')) {
      $(this).parent().find('span').html(forward.format('MMMM'));
      self.calendarOpen(self.element, forward);
    }
  });

  $('.dr-year-switcher i').click(function() {
    var m = $('.dr-month-switcher span').html();
    var y = $('.dr-year-switcher span').html();
    var back = moment(new Date(m +' 1, '+ y)).subtract(1, 'year');
    var forward = moment(new Date(m +' 1, '+ y)).add(1, 'year').startOf('day');

    if ($(this).hasClass('icon-left')) {  
      $(this).parent().find('span').html(back.format('YYYY'));
      self.calendarOpen(self.element, back);
    } else if ($(this).hasClass('icon-right')) {
      $(this).parent().find('span').html(forward.format('YYYY'));
      self.calendarOpen(self.element, forward);
    }
  });

  $('.dr-dates-dash').click(function() {
    $('.dr-date-start').trigger('click');
  });

  $('.daterange').click(function(event) {
    $('html').one('click',function() {
      if (self.presetIsOpen)
        self.presetToggle();

      if (self.calIsOpen) {
        self.calendarSetDates();
        self.calendarClose('force');
      }
    });

    event.stopPropagation();
  });

  $('.daterange, .dr-date').focus(function(event) {
    $('html').one('click',function() {
      if (self.calIsOpen) {
        self.calendarSetDates();
        self.calendarClose('force');
      }
    });

    event.stopPropagation();
  });
}


Calendar.prototype.presetToggle = function() {
  if (this.presetIsOpen == false) {
    this.presetIsOpen = true;
    this.presetCreate();
  } else if (this.presetIsOpen) {
    this.presetIsOpen = false;
  }

  if (this.calIsOpen == true)
    this.calendarClose();

  $('.dr-preset-list').slideToggle(200);
  $('.dr-input').toggleClass('active');
  $('.dr-presets').toggleClass('active');
}


Calendar.prototype.presetCreate = function() {
  var self = this;
  var date = this.latest;

  var s = new Date($('.dr-date-start').html());
  var e = new Date($('.dr-date-end').html());
  this.start_date = s == 'Invalid Date' ? this.start_date : s;
  this.end_date = e == 'Invalid Date' ? this.end_date : e;

  $('.dr-list-item').each(function() {
    var month_count = $(this).data('months');
    var last_day = moment(date).endOf('month').startOf('day');
    var is_last_day = last_day.isSame(date);
    var first_day;

    if (!is_last_day)
      last_day = moment(date).subtract(1, 'month').endOf('month').startOf('day');

    if (typeof month_count == 'number') {
      first_day = moment(date).subtract(is_last_day ? month_count - 1 : month_count, 'month').startOf('month');

      if (month_count == 12)
        first_day = moment(date).subtract(is_last_day ? 12 : 13, 'month').endOf('month').startOf('day');
    } else if (month_count == 'all') {
      first_day = moment(self.earliest);
      last_day = moment(self.latest);
    } else {
      first_day = moment(self.latest).subtract(30, 'day');
      last_day = moment(self.latest);
    }

    $('.dr-item-aside', this).html(first_day.format('ll') +' – '+ last_day.format('ll'));
  });
}


Calendar.prototype.calendarSetDates = function() {
  $('.dr-date-start').html(moment(this.start_date).format('MMMM D, YYYY'));
  $('.dr-date-end').html(moment(this.end_date).format('MMMM D, YYYY'));

  if (!this.start_date && !this.end_date) {
    var old_date = $('.dr-date').html();
    var new_date = moment(this.current_date).format('MMMM D, YYYY');

    if (old_date != new_date)
      $('.dr-date').html(new_date);
  }
}


Calendar.prototype.calendarSaveDates = function() {
  var start = moment(this.start_date).format("YYYY-MM-DD"),
      end = moment(this.end_date).format("YYYY-MM-DD"),
      url = "?start_date="+ start +"&end_date="+ end,
      full = (window.location.pathname + url + window.location.hash);
  
  window.setTimeout(function() {
    window.location = full;
  }, 200);
}


Calendar.prototype.calendarCheckDates = function() {
  var regex = /(?!<=\d)(st|nd|rd|th)/;
  var s = $('.dr-date-start').html();
  var e = $('.dr-date-end').html();
  var c = $(this.element).html();
  var s_array = [];
  var e_array = [];
  var c_array = [];

  if (s) {
    s = s.replace(regex, '');
    s_array = s.split(' ');
  }

  if (e) {
    e = e.replace(regex, '');
    e_array = e.split(' ');
  }

  if (c) {
    c = c.replace(regex, '');
    c_array = c.split(' ');
  }

  if (s_array.length == 2) {
    s_array.push(moment().format('YYYY'))
    s = s_array.join(' ');
  }

  if (e_array.length == 2) {
    e_array.push(moment().format('YYYY'))
    e = e_array.join(' ');
  }

  if (c_array.length == 2) {
    c_array.push(moment().format('YYYY'))
    c = c_array.join(' ');
  }

  s = new Date(s);
  e = new Date(e);
  c = new Date(c);

  if (moment(s).isAfter(e) || 
      moment(e).isBefore(s) || 
      moment(s).isSame(e) ||
      moment(s).isBefore(this.earliest) ||
      moment(e).isAfter(this.latest)) {
    return this.calendarSetDates();
  }

  this.start_date = s == 'Invalid Date' ? this.start_date : s;
  this.end_date = e == 'Invalid Date' ? this.end_date : e;
  this.current_date = c == 'Invalid Date' ? this.current_date : c;
}


Calendar.prototype.calendarOpen = function(element, switcher) {
  var self = this;
  var other;
  var cal_width = $('.dr-dates').innerWidth() - 8;

  this.element = element || this.element;

  if (this.presetIsOpen == true)
    this.presetToggle();

  if (this.calIsOpen == true)
    this.calendarClose(switcher ? 'switcher' : undefined);

  this.calendarCheckDates();
  this.calendarCreate(switcher);
  this.calendarSetDates();

  var next_month = moment(switcher || this.current_date).add(1, 'month').startOf('month').startOf('day');
  var past_month = moment(switcher || this.current_date).subtract(1, 'month').endOf('month');
  var next_year = moment(switcher || this.current_date).add(1, 'year').startOf('month').startOf('day');
  var past_year = moment(switcher || this.current_date).subtract(1, 'year').endOf('month');

  $('.dr-month-switcher span').html(moment(switcher || this.current_date).format('MMMM'));
  $('.dr-year-switcher span').html(moment(switcher || this.current_date).format('YYYY'));

  $('.dr-switcher i').removeClass('dr-disabled');

  if (next_month.isAfter(this.latest))
    $('.dr-month-switcher .icon-right').addClass('dr-disabled');

  if (past_month.isBefore(this.earliest))
    $('.dr-month-switcher .icon-left').addClass('dr-disabled');

  if (next_year.isAfter(this.latest))
    $('.dr-year-switcher .icon-right').addClass('dr-disabled');

  if (past_year.isBefore(this.earliest))
    $('.dr-year-switcher .icon-left').addClass('dr-disabled');

  $('.dr-day').on({
    mouseenter: function() {
      var element = $(this);
      var start_date = moment(self.start_date);
      var end_date = moment(self.end_date);
      var current_date = moment(self.current_date);

      if (start_date.isSame(current_date)) {
        element.addClass('dr-hover dr-hover-before');
        $('.dr-start').css({'border': 'none', 'padding-left': '0.3125rem'});
        setMaybeRange('start');
      }

      if (end_date.isSame(current_date)) {
        element.addClass('dr-hover dr-hover-after');
        $('.dr-end').css({'border': 'none', 'padding-right': '0.3125rem'});
        setMaybeRange('end');
      }

      if (!self.start_date && !self.end_date)
        element.addClass('dr-maybe');

      $('.dr-selected').css('background-color', 'transparent');

      function setMaybeRange(type) {
        other = undefined;

        $.each(_.range(6 * 7), function(i) {
          var next = element.next().data('date');
          var prev = element.prev().data('date');
          var curr = element.data('date');

          if (!curr)
            return false;

          if (!prev)
            prev = curr;

          if (!next)
            next = curr;

          if (type == 'start')
            if (moment(next).isSame(self.end_date))
              return false;

          if (type == 'end')
            if (moment(prev).isSame(self.start_date))
              return false;


          if (type == 'start') {
            if (moment(curr).isAfter(self.end_date)) {
              other = other || moment(curr).add(6, 'day').startOf('day');

              if (i > 5 || (next ? moment(next).isAfter(self.latest) : false)) {
                $(element).addClass('dr-end');
                other = moment(curr);
                return false;
              }
            }
          }

          if (type == 'end') {
            if (moment(curr).isBefore(self.start_date)) {
              other = other || moment(curr).subtract(6, 'day');

              if (i > 5 || (prev ? moment(prev).isBefore(self.earliest) : false)) {
                $(element).addClass('dr-start');
                other = moment(curr);
                return false;
              }
            }
          } 


          if (type == 'start')
            element = element.next().addClass('dr-maybe');

          if (type == 'end')
            element = element.prev().addClass('dr-maybe');
        });
      }
    },
    mouseleave: function() {
      $(this).removeClass('dr-hover dr-hover-before dr-hover-after');
      $('.dr-start, .dr-end').css({'border': '', 'padding': ''});
      $('.dr-maybe:not(.dr-current)').removeClass('dr-start dr-end');
      $('.dr-day').removeClass('dr-maybe');
      $('.dr-selected').css('background-color', '');

      if (!$('.dr-maybe').length)
       $(this).removeClass('dr-start dr-end');
    },
    mousedown: function() {
      var date = $(this).data('date');
      var string = moment(date).format('MMMM D, YYYY');

      if (other) {
        $('.dr-date')
          .not(self.element)
          .html(other.format('MMMM D, YYYY'));
      }

      $(self.element).html(string);
      self.calendarOpen(self.element);

      if ($(self.element).hasClass('dr-date-start')) {
        $('.dr-date-end').trigger('click');
      } else if ($(self.element).hasClass('dr-date-end')) {
        self.calendarSaveDates();
        self.calendarClose('force');
      } else {
        self.calendarClose('force');
      }
    }
  });

  $('.dr-calendar')
    .css('width', cal_width)
    .slideDown(200);
  $('.dr-input').addClass('active');
  $(element).addClass('active').focus();

  this.calIsOpen = true;
}


Calendar.prototype.calendarClose = function(type) {
  if (!this.calIsOpen || this.presetIsOpen || type == 'force') {
    $('.dr-date-start, .dr-date-end').blur();
    $('.dr-calendar').slideUp(200, function() {
      $('.dr-day').remove();
    });
  } else {
    $('.dr-day').remove();
  }

  if (type == 'switcher') {
    return false;
  }

  $('.dr-input, .dr-date').removeClass('active');

  this.calIsOpen = false;
}


Calendar.prototype.calendarArray = function(start, end, current, switcher) {
  var self = this;
  var current = current || start || end;

  var first_day = moment(switcher || current).startOf('month');
  var last_day = moment(switcher || current).endOf('month');

  var current_month = {
    start: {
      day: +first_day.format('d'), 
      str: +first_day.format('D')
    }, 
    end: {
      day: +last_day.format('d'), 
      str: +last_day.format('D')
    }
  }


  // Beginning faded dates
  var d = undefined;

  var start_hidden = _.map(_.range(current_month.start.day), function() {
    if (d == undefined) {
      d = moment(first_day);
    } d = d.subtract(1, 'day');

    return {
      str: +d.format('D'),
      start: d.isSame(start),
      end: d.isSame(end),
      current: d.isSame(current),
      selected: d.isBetween(start, end),
      date: d.toISOString(),
      outside: d.isBefore(self.earliest),
      fade: true
    }
  }).reverse();


  // Leftover faded dates
  var leftover = (6 * 7) - (current_month.end.str + start_hidden.length);
  d = undefined;

  var end_hidden = _.map(_.range(leftover), function() {
    if (d == undefined) {
      d = moment(last_day);
    } d = d.add(1, 'day').startOf('day');

    return {
      str: +d.format('D'),
      start: d.isSame(start),
      end: d.isSame(end),
      current: d.isSame(current),
      selected: d.isBetween(start, end),
      date: d.toISOString(),
      outside: d.isAfter(self.latest),
      fade: true
    }
  });


  // Actual visible dates
  d = undefined;

  var visible = _.map(_.range(current_month.end.str), function() {
    if (d == undefined) {
      d = moment(first_day);
    } else {
      d = d.add(1, 'day').startOf('day');
    }

    return {
      str: +d.format('D'),
      start: d.isSame(start),
      end: d.isSame(end),
      current: d.isSame(current),
      selected: d.isBetween(start, end),
      date: d.toISOString(),
      outside: d.isBefore(self.earliest) || d.isAfter(self.latest)
    }
  });


  return start_hidden.concat(visible, end_hidden);
}


Calendar.prototype.calendarCreate = function(switcher) {
  var array = this.calendarArray(this.start_date, this.end_date, this.current_date, switcher);

  _.each(array, function(d, i) {
    var classString = "dr-day";

    if (d.fade)
      classString += " dr-fade";

    if (d.start)
      classString += " dr-start";

    if (d.end)
      classString += " dr-end";

    if (d.current)
      classString += " dr-current";
    
    if (d.selected)
      classString += " dr-selected";

    if (d.outside)
      classString += " dr-outside";

    $('.dr-day-list').append('<li class="'+ classString +'" data-date="'+ d.date +'">'+ d.str +'</li>');
  });
}

if ($('.daterange--single').length) {
  new Calendar();
} else if ($('.daterange').length) {
  new Calendar({
    earliest: new Date($('.daterange').data('earliest')),
    latest: new Date($('.daterange').data('latest')),
    start: new Date($('.dr-date-start').html()),
    end: new Date($('.dr-date-end').html())
  });
}