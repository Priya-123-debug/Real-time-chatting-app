// Generates a default avatar image URL from a username's initials.
// Falls back to this whenever profilePic is missing or fails to load.
export function getAvatarUrl(username, profilePic) {
  if (profilePic) return profilePic;

  const name = encodeURIComponent(username || "User");
  // Matches the app's violet/cyan theme — background + white bold initials
  return `https://ui-avatars.com/api/?name=${name}&background=8B5CF6&color=fff&bold=true&size=128`;
}