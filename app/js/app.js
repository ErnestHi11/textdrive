var TD = angular.module('TD.app', []);

TD.log = angular.module('TD.log', []);

// we ask for editor, to get it instantiated before we load settings,
// because editor register listeners
angular.module('TD', ['TD.app', 'TD.log']).run(function($window, settings, editor, tabs, $rootScope, log) {

  // load settings from local storage
  settings.load();
  tabs.add();


  var KEY = {};
  // create key map A - Z
  for (var i = 65; i <= 90; i++) {
    KEY[String.fromCharCode(i).toUpperCase()] = i;
  }

  // clipboard - copy, paste, cut
  document.getElementById('editor').addEventListener('keydown', function(event) {

    if (!event.metaKey && !event.ctrlKey) {
      return;
    }

    switch (event.keyCode) {
      case KEY.C:
        document.execCommand('copy');
        break;
      case KEY.V:
        document.execCommand('paste');
        break;
      case KEY.X:
        document.execCommand('cut');
        break;
    }
  });

  var applyEvent = function(eventName, event) {
    event.preventDefault();

    $rootScope.$apply(function() {
      $rootScope.$broadcast(eventName);
    });
  };

  document.addEventListener('keydown', function(event) {

    // ESC
    if (event.keyCode === 27) {
      applyEvent('escape', event);
      return;
    }

    if (!event.metaKey && !event.ctrlKey) {
      return;
    }

    switch (event.keyCode) {
      case KEY.W:
        return applyEvent('close', event);
      case KEY.N:
        return applyEvent('new', event);
      case KEY.S:
        return applyEvent('save', event);
      case KEY.O:
        return applyEvent('open', event);
      case KEY.F:
        return applyEvent('search', event);
      case KEY.Q:
        return applyEvent('quit', event);
      case 188: // CMD+,
        return applyEvent('settings', event);
    }
  });

  var MAX_TAB_SIZE = 200;
  var MIN_TAB_SIZE = 50;
  var countTabSize = function() {
    var countedWidth = (window.innerWidth - 140) / tabs.length;
    return Math.max(Math.min(countedWidth + 23, MAX_TAB_SIZE), MIN_TAB_SIZE);
  };

  $rootScope.tabWidth = MAX_TAB_SIZE;

  $rootScope.$watch(function() { return tabs.length; }, function() {
    $rootScope.tabWidth = countTabSize();
    log('tab width', $rootScope.tabWidth);
  });

  var timer;
  window.addEventListener('resize', function(e) {
    if (timer) {
      return;
    }

    timer = setTimeout(function() {
      var tabWidth = countTabSize();

      if ($rootScope.tabWidth !== tabWidth) {
        $rootScope.tabWidth = tabWidth;
        $rootScope.$digest();
      }
      timer = null;
    }, 50);
  });
});




// HIGHLIGHTING - just for presenting controllers
// Super hacked, don't look into this code :-D


var divsCache = {};
var names = [];

angular.forEach(document.querySelectorAll('[ng-controller]'), function(elm) {
  var ctrlName = elm.getAttribute('ng-controller');
  var div = angular.element(document.createElement('div'));

  div.addClass('controller-highlight ' + ctrlName);
  div.html('<span>' + ctrlName + '</span>');
  div.css('display', 'none');

  document.body.appendChild(div[0]);
  divsCache[ctrlName] = div;
  names.push(ctrlName);

});

var getCtrlName = function(elm) {
  var ctr = null;

  while(elm) {
    ctrl = elm.getAttribute('ng-controller');
    if (ctrl) return ctrl;
    elm = elm.parentElement;
  }

  return ctrl;
};

var hideAll = function() {
  angular.forEach(divsCache, function(div) {
    div.css('display', 'none');
  });
};

var toggle = function(div) {
  div.css('display', div.css('display') === 'none' ? 'block' : 'none');
};


document.addEventListener('keydown', function(e) {
  if (e.keyCode === 27) {
    hideAll();
    return;
  }

  if (!e.metaKey && !e.ctrlKey) {
    return;
  }

  // E
  if (e.keyCode === 69) {
    // for (var i = 0; i < names.length; i++) {
    //   var div = divsCache[names[i]];
    //   if (div.css('display') === 'none') {
    //     div.css('display', 'block');
    //     return;
    //   }
    // }

    hideAll();
    return;
  }

  // 1, 2, 3
  if (48 < e.keyCode && e.keyCode < 53) {
    toggle(divsCache[names[e.keyCode - 49]]);
  }
});


document.addEventListener('click', function(e) {
  if (e.metaKey || e.ctrlKey) {
    toggle(divsCache[getCtrlName(e.target)]);
  }
});

