const SUFFIX = '{suffix}';

enum Pages {
  EMPTY = '',
  LOGIN = 'login',
  START = 'start',
  PUZZLE = 'puzzle',
  PUZZLE_AND_SUFFIX = `puzzle-${SUFFIX}`,
  STATS = 'stats',
  NOT_FOUND = 'not-found',
}

export { Pages, SUFFIX };
