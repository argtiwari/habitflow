export const getAvatarImage = (heroId, level) => {
  if (!heroId) return null;
  
  const id = heroId.toLowerCase();
  
  // Evolution Logic
  if (level >= 20) {
    return `/avatars/${id}/3.png`; // Legend Form
  } else if (level >= 10) {
    return `/avatars/${id}/2.png`; // Warrior Form
  } else {
    return `/avatars/${id}/1.png`; // Rookie Form
  }
};