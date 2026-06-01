/** Une offre publique a un code ou un texte promo ; une offre exclusive est réservée aux abonnés. */
export function isPublicOffer(post) {
  return !post.is_exclusive && Boolean(post.promo_text || post.promo_code);
}

export function isExclusiveOffer(post) {
  return Boolean(post.is_exclusive);
}

export function splitBoutiquePosts(posts = []) {
  const publicOffers = posts.filter(isPublicOffer);
  const exclusiveOffers = posts.filter(isExclusiveOffer);
  const news = posts.filter((p) => !isPublicOffer(p) && !isExclusiveOffer(p));
  return { publicOffers, exclusiveOffers, news };
}

export function hasSpecialOffers({ publicOffers, exclusiveOffers }) {
  return publicOffers.length > 0 || exclusiveOffers.length > 0;
}
