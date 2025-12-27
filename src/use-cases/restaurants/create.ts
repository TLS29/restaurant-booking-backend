import { IUnitOfWork } from "../../repositories/interfaces/unit-of-work";
import { CreateDTO } from "../../dto/restaurant";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * Create Restaurant Use Case
 * Creates a new restaurant under an owner's account
 */
export class Create {
  constructor(private readonly uow: IUnitOfWork) {}

  /**
   * Executes the restaurant creation process
   * @param data - Restaurant data including ownerId
   * @returns Public restaurant data
   * @throws Error if slug already exists
   */
  async execute(data: CreateDTO & { ownerId: string }) {
    const existingRestaurant = await this.uow.restaurantRepository.findBySlug(
      data.slug
    );
    if (existingRestaurant) {
      throw new Error(ERROR_MESSAGES.SLUG_ALREADY_EXISTS);
    }

    const restaurant = await this.uow.restaurantRepository.create({
      email: data.email,
      name: data.name,
      phone: data.phone,
      address: data.address,
      slug: data.slug,
      openingTime: new Date(`1970-01-01T${data.openingTime}:00`),
      closingTime: new Date(`1970-01-01T${data.closingTime}:00`),
      reservationDuration: data.reservationDuration,
      ownerId: data.ownerId,
    });

    return restaurant.toPublic();
  }
}
