// The GitHub repository allowed to trigger notifications in this Discord channel
export const ALLOWED_REPOSITORY = 'JustAutoAttack/GitCord';

// Color palette mapping to GitHub's native UI themes for Discord container accents
export const COLORS = {
	PUSH: 0x2f81f7, // GitHub Blue: Used for branch updates and commits
	PR_OPEN: 0x238636, // GitHub Green: Used for opened pull requests
	PR_CLOSE: 0xda3633, // GitHub Red: Used for closed/rejected pull requests and issues
	PR_MERGED: 0x8957e5, // GitHub Purple: Used for successfully merged pull requests
	ISSUE: 0xdb6d28, // GitHub Orange: Used for active/opened issues
	RELEASE: 0xf0883e, // GitHub Amber: Used for published repository releases
	BRANCH: 0x7ee787 // GitHub Light Green: Used for new branch creation events
};
