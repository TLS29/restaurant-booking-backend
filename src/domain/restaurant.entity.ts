export class Restaurant {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public email: string,
    public phone: string | null,
    public address: string | null,
    public openingTime: Date,
    public closingTime: Date,
    public reservationDuration: number,
    public ownerId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null
  ) {}

  toPublic() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      email: this.email,
      phone: this.phone,
      address: this.address,
      openingTime: this.openingTime,
      closingTime: this.closingTime,
      reservationDuration: this.reservationDuration,
    };
  }
}

export interface CreateRestaurantData {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  openingTime: Date;
  closingTime: Date;
  reservationDuration?: number;
  ownerId: string;
}

export type UpdateRestaurantData = Partial<CreateRestaurantData>;
