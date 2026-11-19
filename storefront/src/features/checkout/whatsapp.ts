export function getOrderWhatsAppUrl(orderNumber: string, message: string): string {
  const text = encodeURIComponent(`${message} ${orderNumber}`);

  return `https://wa.me/201145335168?text=${text}`;
}
