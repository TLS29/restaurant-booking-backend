/**
 * Restaurant Domain Entity
 * Pure business object representing a restaurant
 */
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

  /**
   * Returns restaurant data without sensitive fields (for API responses)
   */
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

/**
 * Data required to create a new restaurant
 */
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

/**
 * Data for updating a restaurant (all fields optional)
 */
export type UpdateRestaurantData = Partial<CreateRestaurantData>;
