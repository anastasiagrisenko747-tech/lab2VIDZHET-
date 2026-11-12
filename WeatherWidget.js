import { UIComponent } from "../UIComponent.js";

export class WeatherWidget extends UIComponent {
  constructor(id, dashboard) {
    super(id, "Погода", dashboard);
    this.icon = "☀";
    this.iconClass = "icon-weather";
    this.kicker = "СЕЙЧАС В БЕРЛИНЕ";
  }

  render() {
    const card = super.render();
    this.loadWeather();
    return card;
  }

  async loadWeather() {
    if (!this.body) return;
    if (this.abortController) this.abortController.abort();
    this.abortController = new AbortController();
    this.body.replaceChildren(this.createLoading());

    try {
      const url = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.405&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=Europe%2FBerlin";
      const response = await fetch(url, { signal: this.abortController.signal });
      if (!response.ok) throw new Error(`Сервер ответил с кодом ${response.status}`);
      const data = await response.json();
      if (!data.current) throw new Error("В ответе API нет текущих погодных данных.");
      if (!this.body) return;
      this.renderWeather(data.current);
    } catch (error) {
      if (error.name === "AbortError") return;
      this.renderError("Не удалось загрузить погоду. Проверьте подключение к интернету.", () => this.loadWeather());
    }
  }

  createLoading() {
    const loading = document.createElement("div");
    loading.className = "loading";
    const spinner = document.createElement("span");
    spinner.className = "spinner";
    const label = document.createElement("span");
    label.textContent = "Получаем актуальную погоду…";
    loading.append(spinner, label);
    return loading;
  }

  renderWeather(current) {
    this.body.replaceChildren();
    const main = document.createElement("div");
    main.className = "weather-main";
    const symbol = document.createElement("div");
    symbol.className = "weather-symbol";
    symbol.textContent = this.weatherInfo(current.weather_code).icon;
    const info = document.createElement("div");
    const temp = document.createElement("div");
    temp.className = "temperature";
    temp.textContent = `${Math.round(current.temperature_2m)}°`;
    const desc = document.createElement("div");
    desc.className = "weather-description";
    desc.textContent = this.weatherInfo(current.weather_code).label;
    info.append(temp, desc);
    main.append(symbol, info);

    const details = document.createElement("div");
    details.className = "weather-details";
    details.append(
      this.detail("Ощущается", `${Math.round(current.apparent_temperature)}°`),
      this.detail("Влажность", `${current.relative_humidity_2m}%`),
      this.detail("Ветер", `${Math.round(current.wind_speed_10m)} км/ч`)
    );

    const footer = document.createElement("div");
    footer.className = "widget-footer";
    const time = document.createElement("span");
    time.textContent = `Обновлено: ${new Date(current.time).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}`;
    const retry = this.retryButton();
    footer.append(time, retry);
    this.body.append(main, details, footer);
  }

  detail(label, value) {
    const box = document.createElement("div");
    box.className = "detail-box";
    const name = document.createElement("div");
    name.className = "detail-label";
    name.textContent = label;
    const val = document.createElement("div");
    val.className = "detail-value";
    val.textContent = value;
    box.append(name, val);
    return box;
  }

  weatherInfo(code) {
    if (code === 0) return { icon: "☀️", label: "Ясно" };
    if ([1, 2].includes(code)) return { icon: "🌤️", label: "Преимущественно ясно" };
    if (code === 3) return { icon: "☁️", label: "Облачно" };
    if ([45, 48].includes(code)) return { icon: "🌫️", label: "Туман" };
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { icon: "🌧️", label: "Дождь" };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: "❄️", label: "Снег" };
    if ([95, 96, 99].includes(code)) return { icon: "⛈️", label: "Гроза" };
    return { icon: "🌡️", label: "Погодные условия" };
  }

  retryButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "retry-button";
    button.textContent = "↻ Обновить";
    button.addEventListener("click", () => this.loadWeather());
    return button;
  }

  renderError(message, retry) {
    this.body.replaceChildren();
    const error = document.createElement("div");
    error.className = "error-box";
    error.textContent = message;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "retry-button";
    button.style.marginTop = "10px";
    button.textContent = "↻ Повторить";
    button.addEventListener("click", retry);
    this.body.append(error, button);
  }

  destroy() {
    if (this.abortController) this.abortController.abort();
    super.destroy();
  }
}