function calculatePrice(unitPrice, options = {}) {
  const quantity = options.quantity ?? 1;
  const discountPercent = options.discountPercent ?? 0;
  const vatPercent = options.vatPercent ?? 0;

  if (typeof unitPrice !== 'number' || !Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new TypeError('unitPrice must be a finite number >= 0');
  }
  if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity <= 0) {
    throw new RangeError('quantity must be a finite number > 0');
  }
  if (typeof discountPercent !== 'number' || !Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
    throw new RangeError('discountPercent must be a finite number between 0 and 100');
  }
  if (typeof vatPercent !== 'number' || !Number.isFinite(vatPercent) || vatPercent < 0) {
    throw new RangeError('vatPercent must be a finite number >= 0');
  }

  const unknownKeys = Object.keys(options).filter(k => k !== 'quantity' && k !== 'discountPercent' && k !== 'vatPercent');
  if (unknownKeys.length > 0) {
    throw new RangeError(`Unknown option(s): ${unknownKeys.join(', ')}`);
  }

  const subtotal = unitPrice * quantity;
  const discount = subtotal * discountPercent / 100;
  const net = subtotal - discount;
  const vat = net * vatPercent / 100;
  const total = net + vat;

  return Object.freeze({
    subtotal,
    discount,
    net,
    vat,
    total,
    quantity,
    discountPercent,
    vatPercent
  });
}

export { calculatePrice };
