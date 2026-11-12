import { UIComponent } from "../UIComponent.js";

export class CurrencyWidget extends UIComponent {
  constructor(id, dashboard) {
    super(id, "Курсы валют", dashboard);
    this.icon = "€";
    this.iconClass = "icon-currency";
    this.kicker = "ЕВРО К ДОЛЛАРУ США";
  }

  render() {
    const card = super.render();
    this.loadRate();
    return card;
  }

  async loadRate() {
    if (!this.body) return;
    if (this.abortController) this.abortController.abort();
    this.abortController = new AbortController();
    this.body.replaceChildren(this.createLoading());

    try {
      const response = await fetch("https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD", {
        signal: this.abortController.signal
      });
      if (!response.ok) throw new Error(`Сервер ответил с кодом ${response.status}`);
      const data = await response.json();
      if (!data.rates || typeof data.rates.USD !== "number") {
        throw new Error("В ответе API отсутствует курс USD.");
      }
      if (!this.body) return;
      this.renderRate(data);
    } catch (error) {
      if (error.name === "AbortError") return;
      this.renderError("Не удалось загрузить курс валют. Проверьте подключение к интернету.");
    }
  }

  createLoading() {
    const loading = document.createElement("div");
    loading.className = "loading";
    const spinner = document.createElement("span");
    spinner.className = "spinner";
    const label = document.createElement("span");
    label.textContent = "Загружаем курс EUR/USD…";
    loading.append(spinner, label);
    return loading;
  }

  renderRate(data) {
    this.body.replaceChildren();
    const pair = document.createElement("div");
    pair.className = "currency-pair";
    const euro = document.createElement("div");
    euro.className = "currency-bubble";
    euro.textContent = "€";
    const arrow = document.createElement("span");
    arrow.className = "currency-arrow";
    arrow.textContent = "→";
    const result = document.createElement("div");
    const rate = document.createElement("div");
    rate.className = "currency-rate";
    rate.textContent = Number(data.rates.USD).toFixed(4);
    const caption = document.createElement("div");
    caption.className = "currency-caption";
    caption.textContent = "доллара США за 1 евро";
    result.append(rate, caption);
    pair.append(euro, arrow, result);

    const footer = document.createElement("div");
    footer.className = "widget-footer";
    const date = document.createElement("span");
    date.textContent = `Дата курса: ${new Date(`${data.date}T00:00:00`).toLocaleDateString("ru-RU")}`;
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "retry-button";
    retry.textContent = "↻ Обновить";
    retry.addEventListener("click", () => this.loadRate());
    footer.append(date, retry);
    this.body.append(pair, footer);
  }

  renderError(message) {
    this.body.replaceChildren();
    const error = document.createElement("div");
    error.className = "error-box";
    error.textContent = message;
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "retry-button";
    retry.style.marginTop = "10px";
    retry.textContent = "↻ Повторить";
    retry.addEventListener("click", () => this.loadRate());
    this.body.append(error, retry);
  }

  destroy() {
    if (this.abortController) this.abortController.abort();
    super.destroy();
  }
}