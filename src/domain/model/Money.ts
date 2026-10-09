export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string = 'COP'
  ) {}

  public static of(amount: number, currency: string = 'COP'): Money {
    if (isNaN(amount) || amount < 0) {
      throw new Error('El importe monetario no puede ser negativo ni inválido.');
    }
    return new Money(Math.round(amount * 100) / 100, currency);
  }

  public static zero(currency: string = 'COP'): Money {
    return new Money(0, currency);
  }

  public add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`No se pueden sumar importes con monedas distintas: ${this.currency} y ${other.currency}`);
    }
    return Money.of(this.amount + other.amount, this.currency);
  }

  public multiply(quantity: number): Money {
    return Money.of(this.amount * quantity, this.currency);
  }

  public format(): string {
    return formatMoney(this.amount);
  }
}

