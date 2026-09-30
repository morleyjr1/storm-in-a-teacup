# Storm in a Teacup

A silly, tea-fuelled game of British idioms. Right answers pour cups of tea, full teapots upgrade the biscuit in your tin, and wrong answers cost teabags and, eventually, lives.

## What's in the folder

| File | What it is |
| --- | --- |
| `index.html` | The page |
| `styles.css` | How it looks |
| `app.js` | How the games work |
| `idioms.js` | The idiom library: meanings, origins, dates, picture clues |
| `friend.js` | The personal bits: dedication, favourite biscuit, in-jokes, house idioms |

It is a plain static site with no build step. Open `index.html` in a browser to play it locally.

## Putting it online (GitHub + Vercel, free)

1. **GitHub:** sign in at github.com, click **New repository**, name it (e.g. `storm-in-a-teacup`), and create it. On the new repo page choose **uploading an existing file**, drag in all the files from this folder, and commit.
2. **Vercel:** go to vercel.com and sign up with your GitHub account. Click **Add New → Project**, pick the repository, and click **Deploy**. There are no settings to change.
3. Vercel gives you a link like `storm-in-a-teacup.vercel.app` to send to your friend. Any change you commit to GitHub updates the site automatically.

## Editing

- **Personal touches:** fill in `friend.js`. Every field is optional.
- **Adding an idiom:** copy an entry in `idioms.js` and change it. `pre`, `word` and `post` make up the phrase; `word` is the gap players fill. `status` is `attested`, `likely` or `unknown`, depending on how solid the origin evidence is.

## About the content

Every meaning and origin note is written for this site rather than copied from a reference work. Where an origin is disputed or unknown, the game says so. Popular origin myths appear only in the "True story or tall tale?" questions, labelled as myths.

Scores and Brewtionary entries are saved in each player's own browser.
