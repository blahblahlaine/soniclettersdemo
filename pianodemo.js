/**
  Copyright 2012 Michael Morris-Pearce

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

(function () {

  /* Piano keyboard pitches. Names match sound files by ID attribute. */
  
  var keys =[
    'A0', 'Bb0', 'B0',
      
    'C1', 'Db1', 'D1', 'Eb1', 'E1', 'F1', 'Gb1', 'G1', 'Ab1',
    'A1', 'Bb1', 'B1',
      
    'C2', 'Db2', 'D2', 'Eb2', 'E2', 'F2', 'Gb2', 'G2', 'Ab2',
    'A2', 'Bb2', 'B2',
      
    'C3', 'Db3', 'D3', 'Eb3', 'E3', 'F3', 'Gb3', 'G3', 'Ab3',
    'A3', 'Bb3', 'B3',
      
    'C4', 'Db4', 'D4', 'Eb4', 'E4', 'F4', 'Gb4', 'G4', 'Ab4',
    'A4', 'Bb4', 'B4',
    
    'C5', 'Db5', 'D5', 'Eb5', 'E5', 'F5', 'Gb5', 'G5', 'Ab5',
    'A5', 'Bb5', 'B5',
      
    'C6', 'Db6', 'D6', 'Eb6', 'E6', 'F6', 'Gb6', 'G6', 'Ab6',
    'A6', 'Bb6', 'B6',
      
    'C7', 'Db7', 'D7', 'Eb7', 'E7', 'F7', 'Gb7', 'G7', 'Ab7',
    'A7', 'Bb7', 'B7',
    
    'C8'
  ];

  /* Corresponding keyboard keycodes, in order w/ 'keys'. */
  /* QWERTY layout:
  /*   upper register: Q -> P, with 1-0 as black keys. */
  /*   lower register: Z -> M, , with A-L as black keys. */
  
  var codes = [
     65,   8,    97,
      
     66,   8,   98,   8,    67,   99,   8,    68,   8,   100,   8,   69,   
      
     101,  8,    70,   8,   102,    71,   8,    103,   8,   72,    8,   104,
     
     73,    8,    105,   8,   74,    106,   8,    75,  8,
    107,    8,   76,
      
     108,   8,    77,   8,   109,    78,   8,    110,   8,  79,    8,   111,
      
     80,    8,    112,   8,   81,   113,   8,   82,   8,
     114,   8,   83,

     115,   8,   84,   8,   116,   85,   8,   117,   8,
      86,   8,    118,
      
      
      87,   8,   119,   8,   88,   120,   8,   89,   8,
      121,   8,   90,
      
      122
     
  ];
  
  var pedal = 32; /* Keycode for sustain pedal. */
  var tonic = 'A0'; /* Lowest pitch. */
  
  /* Piano state. */
  
  var intervals = {};
  var depressed = {};
  
  /* Selectors */
  
  function pianoClass(name) {
    return '.piano-' + name;
  };
  
  function soundId(id) {
    return 'sound-' + id;
  };
  
  function sound(id) {
    var it = document.getElementById(soundId(id));
    return it;
  };

  /* Virtual piano keyboard events. */
  
  function keyup(code) {
    var offset = codes.indexOf(code);
    var k;
    if (offset >= 0) {
      k = keys.indexOf(tonic) + offset;
      return keys[k];
    }
  };
  
  function keydown(code) {
    return keyup(code);
  };
  
  function press(key) {
    var audio = sound(key);
    if (depressed[key]) {
      return;
    }
    clearInterval(intervals[key]);
    if (audio) {
      audio.pause();
      audio.volume = 1.0;
      if (audio.readyState >= 2) {
        audio.currentTime = 0;
        audio.play();
        depressed[key] = true;
      }
    }
    $(pianoClass(key)).animate({
    
    }, 0);
  };

  /* Manually diminish the volume when the key is not sustained. */
  /* These values are hand-selected for a pleasant fade-out quality. */
  
  function fade(key) {
    var audio = sound(key);
    var stepfade = function() {
      if (audio) {
        if (audio.volume < 0.03) {
          kill(key)();
        } else {
          if (audio.volume > 0.2) {
            audio.volume = audio.volume * 0.95;
          } else {
            audio.volume = audio.volume - 0.01;
          }
        }
      }
    };
    return function() {
      clearInterval(intervals[key]);
      intervals[key] = setInterval(stepfade, 5);
    };
  };

  /* Bring a key to an immediate halt. */
  
  function kill(key) {
    var audio = sound(key);
    return function() {
      clearInterval(intervals[key]);
      if (audio) {
        audio.pause();
      }
      if (key.length > 2) {
        $(pianoClass(key)).animate({
        
        }, 300, 'easeOutExpo');
      } else {
        $(pianoClass(key)).animate({
          'backgroundColor':'white'
        }, 300, 'easeOutExpo');
      }
    };
  };

  /* Simulate a gentle release, as opposed to hard stop. */
  
  var fadeout = true;

  /* Sustain pedal, toggled by user. */
  
  var sustaining = false;

  
  /* Register keyboard event callbacks. */
  
  $(document).keydown(function(event) {
    if (event.which === pedal) {
      sustaining = true;
      $(pianoClass('pedal')).addClass('piano-sustain');
    }
    var code = event.which;
    if (!event.shiftKey) {
      code += 32;
    }
    press(keydown(code));
  });
  
  $(document).keyup(function(event) {
    var code = event.which;
    if (!event.shiftKey) {
      code += 32;
    }

    if (event.which === pedal) {
      sustaining = false;
      $(pianoClass('pedal')).removeClass('piano-sustain');
      Object.keys(depressed).forEach(function(key) {
        if (!depressed[key]) {
          if (fadeout) {
            fade(key)();
          } else {
            kill(key)();
          }
        }
      });
    }
    if (keyup(code)) {
      depressed[keyup(code)] = false;
      if (!sustaining) {
        if (fadeout) {
          fade(keyup(code))();
        } else {
          kill(keyup(code))();
        }
      }
    }
  });

})();



 