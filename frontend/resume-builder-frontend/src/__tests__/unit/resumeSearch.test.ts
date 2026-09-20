import { editDistance, searchByName } from '../../renderer/utils/resumeSearch';

const names = ['Backend developer', 'Frontend developer', 'Data analyst'];

function search(query: string) {
  return searchByName(names, query, (name) => name);
}

describe('editDistance', () => {
  it('is 0 for equal strings and counts single edits', () => {
    expect(editDistance('abc', 'abc')).toBe(0);
    expect(editDistance('abc', 'abd')).toBe(1); // substitution
    expect(editDistance('abc', 'ab')).toBe(1); // deletion
    expect(editDistance('abc', 'abcd')).toBe(1); // insertion
  });

  it('falls back to the other string length when one side is empty', () => {
    expect(editDistance('', 'abcd')).toBe(4);
    expect(editDistance('abcd', '')).toBe(4);
  });
});

describe('searchByName', () => {
  it('returns every item untouched for an empty query', () => {
    expect(search('   ')).toEqual(names);
  });

  it('keeps only substring matches, ignoring case', () => {
    expect(search('data')).toEqual(['Data analyst']);
  });

  it('ranks an earlier substring hit above a later one', () => {
    expect(search('developer')).toEqual([
      'Backend developer',
      'Frontend developer',
    ]);
    expect(search('end developer')).toEqual([
      'Backend developer',
      'Frontend developer',
    ]);
  });

  it('still finds a name the query has a typo in', () => {
    expect(search('Backnd')).toEqual(['Backend developer']);
    expect(search('analist')).toEqual(['Data analyst']);
  });

  it('ranks the exact match above the fuzzy one', () => {
    expect(search('Frontend')[0]).toBe('Frontend developer');
  });

  it('drops everything when nothing is close enough', () => {
    expect(search('zzzzzzzz')).toEqual([]);
  });
});
