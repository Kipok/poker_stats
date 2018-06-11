#!/usr/bin/env python
# -*- coding: utf-8 -*-

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import numpy as np

from deuces import Card as DeucesCard
from deuces import Evaluator

import argparse, itertools


game_evaluator = Evaluator()


VALUES = ['2', '3', '4', '5', '6', '7', '8',
          '9', 'T', 'J', 'Q', 'K', 'A']

SUITS = ['c', 'd', 'h', 's']


class Card(object):
  """Card abstraction."""

  def __str__(self):
    return "{}{}".format(self.value, self.suit)

  def __repr__(self):
    return "{}{}".format(self.value, self.suit)

  def get_idx(self):
    return self.idx

  def __init__(self, value, suit):
    self.value = value.upper()
    self.suit = suit.lower()

    assert self.value in VALUES, self.value
    assert self.suit in SUITS, self.suit

    value_idx = VALUES.index(self.value)
    suit_idx = SUITS.index(self.suit)
    self.idx = value_idx * len(SUITS) + suit_idx


class Hand:
  """Hand abstraction."""

  def __init__(self, *args):
    assert len(args) <= 2, args
    self.cards = args

  def __repr__(self):
    return repr('-'.join(map(repr, self.cards)))

  def __str__(self):
    return str('-'.join(map(str, self.cards)))


class Deck:
  """Deck abstraction."""

  def get_cards(self, indices):
    return self.cards[indices]

  def __init__(self):
    card_fn = lambda x: Card(x[0], x[1])
    cards = map(card_fn, itertools.product(VALUES, SUITS))
    self.cards = np.array([card for card in cards])


class Table:
  """Table abstraction."""

  def __init__(self, cards):
    assert hasattr(cards, '__iter__'), cards
    assert len(cards) in [0, 3, 4, 5], cards

    self.deck = Deck()

    self.init_cards = np.array(list(cards))

  def __str__(self):
    return str(self.init_cards)

  def __repr__(self):
    return repr(self.init_cards)

  def simulate_game(self, hand, op_hands):
    num_ops = len(op_hands)

    indices = np.random.choice(
        np.setdiff1d(
          np.arange(52),
          [hand.cards[0].get_idx(), hand.cards[1].get_idx()] +
          list(map(lambda x: x.get_idx(), self.init_cards))),
        2 * num_ops + 5 - len(self.init_cards),
        replace=False,
    )

    cards = self.deck.get_cards(indices)
    table_cards = np.append(self.init_cards, cards[:5 - len(self.init_cards)])
    tmp_cards = cards[5 - len(self.init_cards):]
    tmp_len = len(tmp_cards) // 2
    op_hands = list(map(lambda x: Hand(x[0], x[1]), zip(tmp_cards[:tmp_len], tmp_cards[tmp_len:])))
    return hand, op_hands, table_cards

  def check_win(self, hand, op_hands, table_cards):
    table_cards = list(map(lambda el: DeucesCard.new(str(el)), table_cards))
    op_hand1 = list(map(lambda el: DeucesCard.new(str(el)), [hand.cards[0], hand.cards[1]]))
    xop_hands = []
    for xhand in op_hands:
      xop_hands.append(list(map(lambda el: DeucesCard.new(str(el)), [xhand.cards[0], xhand.cards[1]])))

    score = 1.0 - game_evaluator.get_five_card_rank_percentage(game_evaluator.evaluate(table_cards, op_hand1))
    for xop_hand in xop_hands:
      score2 = 1.0 - game_evaluator.get_five_card_rank_percentage(game_evaluator.evaluate(table_cards, xop_hand))
      if score2 > score:
        return False
      return True

  def win_percentage(self, hand, op_hands):
    mc_size = 100000
    num_win = 0

    for i in range(mc_size):
      num_win += self.check_win(*self.simulate_game(hand, op_hands))
    return 1.0 * num_win / mc_size


if __name__ == "__main__":
  fmt = argparse.RawDescriptionHelpFormatter

  parser = argparse.ArgumentParser(
    __file__, None, __doc__, formatter_class=fmt)

  def split_cards_string(string):
    if len(string) == 0:
      return []

    card_list = string.split(',')
    fn = lambda x: Card(x[0], x[1])
    return list(map(fn, card_list))

  parser.add_argument(
    '--num_ops',
    type=int,
    default=1,
    help='number of opponents')

  parser.add_argument(
    '--cards_you',
    type=lambda s: split_cards_string(s),
    help='Your cards, e.g. "2h,Ad"')

  for i in range(0, 10):
    parser.add_argument(
      '--cards_op%d' % i,
      default="",
      type=lambda s: split_cards_string(s),
      help='Oponent cards, e.g. "2s,2d"')

  parser.add_argument(
    '--cards_table',
    type=lambda s: split_cards_string(s),
    help='Table cards, e.g. "3h,4h,5d"')

  args = parser.parse_args()
  args_dict = vars(args)

  table = Table(args.cards_table)
  player_hand = Hand(*args.cards_you)

  op_hands = [args_dict["cards_op%d" % i]
              for i in range(1, args.num_ops + 1)]

  print('Win percentage: {}'.format(
    table.win_percentage(player_hand, op_hands)))
