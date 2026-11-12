/**
 * Базовый класс для всех виджетов панели.
 * Создаёт общую карточку с кнопками сворачивания и удаления.
 */
export class UIComponent {
  constructor(id, title, dashboard) {
    this.id = id;
    this.title = title;
    this.dashboard = dashboard;
    this.element = null;
    this.abortController = null;
    this.collapsed = false;
  }

  render() {
    const card = document.createElement("article");
    card.className = "widget-card";
    card.dataset.widgetId = this.id;

    const header = document.createElement("header");
    header.className = "widget-header";

    const heading = document.createElement("div");
    heading.className = "widget-heading";

    const icon = document.createElement("div");
    icon.className = `widget-icon ${this.iconClass || ""}`;
    icon.textContent = this.icon || "✦";

    const titleWrap = document.createElement("div");
    const title = document.createElement("h3");
    title.className = "widget-title";
    title.textContent = this.title;
    const kicker = document.createElement("div");
    kicker.className = "widget-kicker";
    kicker.textContent = this.kicker || "ВАШ ВИДЖЕТ";
    titleWrap.append(title, kicker);
    heading.append(icon, titleWrap);

    const actions = document.createElement("div");
    actions.className = "widget-actions";

    const collapseButton = document.createElement("button");
    collapseButton.className = "icon-button";
    collapseButton.type = "button";
    collapseButton.title = "Свернуть или развернуть";
    collapseButton.setAttribute("aria-label", "Свернуть или развернуть виджет");
    collapseButton.textContent = "⌃";
    collapseButton.addEventListener("click", () => {
      this.collapsed = !this.collapsed;
      card.classList.toggle("collapsed", this.collapsed);
      collapseButton.textContent = this.collapsed ? "⌄" : "⌃";
      this.dashboard.saveState();
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "icon-button delete";
    deleteButton.type = "button";
    deleteButton.title = "Удалить виджет";
    deleteButton.setAttribute("aria-label", "Удалить виджет");
    deleteButton.textContent = "×";
    deleteButton.addEventListener("click", () => this.dashboard.removeWidget(this.id));

    actions.append(collapseButton, deleteButton);
    header.append(heading, actions);

    const body = document.createElement("div");
    body.className = "widget-body";
    card.append(header, body);
    this.element = card;
    this.body = body;
    return card;
  }

  destroy() {
    if (this.abortController) this.abortController.abort();
    if (this.element) this.element.remove();
    this.element = null;
  }
}