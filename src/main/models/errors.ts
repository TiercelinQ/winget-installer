export class WingetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WingetError";
  }
}

export class FavoritesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FavoritesError";
  }
}

export class PreferencesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PreferencesError";
  }
}
