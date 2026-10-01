import "./style.css";

(function () {
  "use strict";

  var GAMES = [
    { name: "Egg Catcher", icon: "🥚", url: "https://eggcatcher-one.vercel.app/", closeMessageType: "close-game" },
    { name: "Frog Game", icon: "🐸", url: "https://froggamedemo.vercel.app/", closeMessageType: "close-game" },
    { name: "Skating Mummy", icon: "💀", url: "https://skatting-mummy.vercel.app/", closeMessageType: "close-game" }
  ];

  var BACK_KEYS = ["Escape", "Backspace", "GoBack", "BrowserBack"];
  var BACK_KEY_CODES = [27, 8, 10009, 461, 4]; // Escape, Backspace, Tizen, webOS, Android TV

  var gridScreen = document.getElementById("grid-screen");
  var gameGrid = document.getElementById("game-grid");
  var playerScreen = document.getElementById("player-screen");
  var iframeHost = document.getElementById("iframe-host");
  var loader = document.getElementById("loader");

  var cards = [];
  var focusedIndex = 0;
  var lastFocusedIndex = 0;
  var openGameIndex = -1;

  function buildGrid() {
    GAMES.forEach(function (game, index) {
      var card = document.createElement("button");
      card.className = "game-card";
      card.type = "button";
      card.tabIndex = -1;
      card.setAttribute("aria-label", game.name);

      var icon = document.createElement("div");
      icon.className = "icon";
      icon.textContent = game.icon;

      var name = document.createElement("div");
      name.className = "name";
      name.textContent = game.name;

      card.appendChild(icon);
      card.appendChild(name);
      card.addEventListener("click", function () {
        openGame(index);
      });

      gameGrid.appendChild(card);
      cards.push(card);
    });
  }

  function focusCard(index) {
    if (index < 0 || index >= cards.length) return;
    focusedIndex = index;
    cards[focusedIndex].focus();
  }

  function openGame(index) {
    lastFocusedIndex = index;
    openGameIndex = index;
    var game = GAMES[index];

    loader.hidden = false;
    iframeHost.innerHTML = "";

    var iframe = document.createElement("iframe");
    iframe.src = game.url;
    iframe.setAttribute("allow", "fullscreen; autoplay; gamepad");
    iframe.setAttribute("allowfullscreen", "true");
    iframe.addEventListener("load", function () {
      loader.hidden = true;
    });

    iframeHost.appendChild(iframe);

    gridScreen.hidden = true;
    playerScreen.hidden = false;
  }

  function closeGame() {
    openGameIndex = -1;
    iframeHost.innerHTML = ""; // fully release the iframe/game memory
    loader.hidden = false;

    playerScreen.hidden = true;
    gridScreen.hidden = false;
    focusCard(lastFocusedIndex);
  }

  function isBackKey(e) {
    return BACK_KEYS.indexOf(e.key) !== -1 || BACK_KEY_CODES.indexOf(e.keyCode) !== -1;
  }

  function onKeyDown(e) {
    var playerOpen = !playerScreen.hidden;

    if (playerOpen) {
      if (isBackKey(e)) {
        e.preventDefault();
        closeGame();
      }
      return;
    }

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        focusCard(Math.min(focusedIndex + 1, cards.length - 1));
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusCard(Math.max(focusedIndex - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        openGame(focusedIndex);
        break;
      default:
        break;
    }
  }

  // Each game posts its own close-message type (see each game's README)
  // when its remote's Back button is pressed — this is the only way to
  // close a game once keyboard focus has moved inside its cross-origin
  // iframe, since key events never bubble out to this parent document.
  function onMessage(e) {
    if (openGameIndex === -1) return;
    var expectedType = GAMES[openGameIndex].closeMessageType;
    if (e.data && e.data.type === expectedType) {
      closeGame();
    }
  }

  buildGrid();
  document.addEventListener("keydown", onKeyDown);
  window.addEventListener("message", onMessage);
  focusCard(0);
})();
