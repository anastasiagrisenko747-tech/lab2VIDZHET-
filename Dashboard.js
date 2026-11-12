import { ToDoWidget } from "./widgets/ToDoWidget.js";
import { WeatherWidget } from "./widgets/WeatherWidget.js";
import { CurrencyWidget } from "./widgets/CurrencyWidget.js";

const STORAGE_KEY = "travelboard-dashboard-v1";

export class Dashboard {
  constructor(container, noticeElement) {
    this.container = container;
    this.noticeElement = noticeElement;
    this.widgets = new Map();
    this.nextId = 1;
  }

  addWidget(type, savedData = null) {
    const allowedTypes = ["todo", "weather", "currency"];
    if (!allowedTypes.includes(type)) {
      this.showNotice("Неизвестный тип виджета.");
      return false;
    }
    if ([...this.widgets.values()].some((widget) => widget.type === type)) {
      this.showNotice("Этот виджет уже добавлен. Повторное добавление невозможно.");
      return false;
    }

    const id = savedData?.id || `widget-${this.nextId++}`;
    let widget;
    if (type === "todo") {
      widget = new ToDoWidget(id, this, savedData?.tasks || []);
    } else if (type === "weather") {
      widget = new WeatherWidget(id, this);
    } else {
      widget = new CurrencyWidget(id, this);
    }
    widget.type = type;
    this.widgets.set(id, widget);
    this.container.append(widget.render());

    if (savedData?.collapsed) {
      widget.collapsed = true;
      widget.element.classList.add("collapsed");
      const collapseButton = widget.element.querySelector(".widget-actions .icon-button");
      if (collapseButton) collapseButton.textContent = "⌄";
    }
    this.saveState();
    this.showNotice("");
    return true;
  }

  removeWidget(id) {
    const widget = this.widgets.get(id);
    if (!widget) return;
    widget.destroy();
    this.widgets.delete(id);
    this.saveState();
    this.showNotice("Виджет удалён.");
  }

  saveState() {
    const state = [...this.widgets.values()].map((widget) => ({
      id: widget.id,
      type: widget.type,
      collapsed: widget.collapsed,
      ...(widget.type === "todo" ? { tasks: widget.tasks } : {})
    }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // Панель продолжает работать даже при запрете localStorage или нехватке места.
      console.warn("Не удалось сохранить состояние панели:", error);
      this.showNotice("Не удалось сохранить изменения в браузере. Панель продолжает работать.");
    }
  }

  restoreState() {
    let saved;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      saved = raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("Сохранённые данные повреждены:", error);
      this.showNotice("Сохранённые данные повреждены. Создана новая панель.");
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      saved = null;
    }

    if (!Array.isArray(saved)) {
      saved = [{ type: "todo" }, { type: "weather" }, { type: "currency" }];
    }
    saved.forEach((item) => {
      if (item && typeof item.type === "string") this.addWidget(item.type, item);
    });
    if (this.widgets.size === 0) this.addWidget("todo");
  }

  showNotice(message) {
    this.noticeElement.textContent = message;
    if (message) {
      clearTimeout(this.noticeTimer);
      this.noticeTimer = setTimeout(() => {
        this.noticeElement.textContent = "";
      }, 4000);
    }
  }
}