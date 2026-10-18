/* Maison Canis · carrito simulado con persistencia en localStorage */
(function () {
  'use strict';
  var KEY = 'maisoncanis.cart.v1';
  var ORDER_KEY = 'maisoncanis.order.v1';
  var listeners = [];
  var memory = [];
  var memoryOrder = null;

  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  function clean(items) {
    var out = [];
    if (!Array.isArray(items)) return out;
    items.forEach(function (it) {
      if (!it || !MC.product(it.id) || !MC.size(it.size)) return;
      var qty = Math.max(1, Math.min(MC.MAX_QTY, parseInt(it.qty, 10) || 1));
      var dup = out.filter(function (o) { return o.id === it.id && o.size === it.size; })[0];
      if (dup) dup.qty = Math.min(MC.MAX_QTY, dup.qty + qty);
      else out.push({ id: it.id, size: it.size, qty: qty });
    });
    return out;
  }

  function load() {
    var stored = read(KEY, null);
    return stored === null ? memory.slice() : clean(stored);
  }
  function save(items) {
    memory = items.slice();
    write(KEY, items);
    listeners.forEach(function (fn) { fn(items); });
  }

  var Cart = {
    items: function () { return load(); },
    count: function () { return load().reduce(function (n, i) { return n + i.qty; }, 0); },
    subtotal: function () {
      return load().reduce(function (sum, i) { return sum + MC.product(i.id).price * i.qty; }, 0);
    },
    add: function (id, size, qty) {
      var items = load();
      var line = items.filter(function (i) { return i.id === id && i.size === size; })[0];
      qty = Math.max(1, parseInt(qty, 10) || 1);
      if (line) line.qty = Math.min(MC.MAX_QTY, line.qty + qty);
      else items.push({ id: id, size: size, qty: Math.min(MC.MAX_QTY, qty) });
      save(items);
    },
    setQty: function (id, size, qty) {
      var items = load();
      items.forEach(function (i) {
        if (i.id === id && i.size === size) i.qty = Math.max(1, Math.min(MC.MAX_QTY, parseInt(qty, 10) || 1));
      });
      save(items);
    },
    setSize: function (id, size, newSize) {
      if (!MC.size(newSize) || newSize === size) return;
      var items = load();
      var from = items.filter(function (i) { return i.id === id && i.size === size; })[0];
      if (!from) return;
      var to = items.filter(function (i) { return i.id === id && i.size === newSize; })[0];
      if (to) {
        to.qty = Math.min(MC.MAX_QTY, to.qty + from.qty);
        items = items.filter(function (i) { return i !== from; });
      } else {
        from.size = newSize;
      }
      save(items);
    },
    remove: function (id, size) {
      save(load().filter(function (i) { return !(i.id === id && i.size === size); }));
    },
    restore: function (item) {
      if (item) Cart.add(item.id, item.size, item.qty);
    },
    clear: function () { save([]); },
    onChange: function (fn) { listeners.push(fn); },
    saveOrder: function (order) {
      memoryOrder = order;
      write(ORDER_KEY, order);
    },
    lastOrder: function () { return read(ORDER_KEY, memoryOrder); }
  };

  window.addEventListener('storage', function (e) {
    if (e.key === KEY) listeners.forEach(function (fn) { fn(load()); });
  });

  MC.cart = Cart;
})();
