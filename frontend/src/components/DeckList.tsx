import React, { useCallback, useMemo } from 'react';
import { Link, ButtonGroup, Flex, IconButton, List, ListItem, SimpleGrid, useBreakpointValue } from '@chakra-ui/react';
import { map } from 'lodash';
import { t } from '@lingui/macro';
import NextLink from 'next/link';

import { DeckFragment, DeckWithCampaignFragment } from '../generated/graphql/apollo-schema';
import { CardsMap } from '../lib/hooks';
import { Text } from '@chakra-ui/react';
import { useAuth } from '../lib/AuthContext';
import { RoleImage } from './CardImage';
import { DeckDescription, MiniAspect } from './Deck';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import DeckProblemComponent from './DeckProblemComponent';
import CoreIcon from '../icons/CoreIcon';
import { DeckError } from '../types/types';


export function DeckRow({ deck, roleCards, onDelete }: {
  deck: DeckWithCampaignFragment;
  roleCards: CardsMap;
  onDelete: (deck: DeckFragment) => void;
}) {
  const { authUser } = useAuth();
  const doDelete = useCallback(() => {
    onDelete(deck);
  }, [onDelete, deck]);
  const buttonOrientation = useBreakpointValue<'vertical' | 'horizontal'>(['vertical', 'vertical', 'horizontal']);
  const problem = !!deck.meta.problem && Array.isArray(deck.meta.problem) ? (deck.meta.problem as DeckError[])  : undefined;
  const role = useMemo(() => {
    return typeof deck.meta.role === 'string' && roleCards[deck.meta.role];
  }, [deck.meta, roleCards]);
  return (
    <ListItem paddingTop={3} paddingBottom={3} borderBottomColor="gray.100" borderBottomWidth="1px">
      <Flex direction="row">
        <Flex flex={[1.2, 1.25, 1.5, 2]} direction="row" alignItems="flex-start" as={NextLink} href={`/decks/view/${deck.id}`}>
          { !!role && !!role.imagesrc && <RoleImage large name={role.name} url={role.imagesrc} /> }
          <Flex direction="column">
            <Text fontSize={['m', 'l', 'xl']}>{deck.name}</Text>
            { !!deck.campaign && <Flex direction="row" alignItems="center"><CoreIcon icon="guide" size={18} /><Link marginLeft={1} as={NextLink} href={`/campaigns/${deck.campaign.id}`}>{deck.campaign.name}</Link></Flex>}
            <DeckDescription fontSize={['xs', 's', 'm']}deck={deck} roleCards={roleCards} />
            { !!problem && <DeckProblemComponent errors={problem} limit={1} />}
          </Flex>
        </Flex>
        <Flex marginLeft={1} direction="row" alignItems="flex-start" justifyContent="space-between">
          <SimpleGrid columns={2} marginRight={1}>
            <MiniAspect aspect="AWA" value={deck.awa} />
            <MiniAspect aspect="SPI" value={deck.spi} />
            <MiniAspect aspect="FIT" value={deck.fit} />
            <MiniAspect aspect="FOC" value={deck.foc} />
          </SimpleGrid>
          { authUser?.uid === deck.user_id && (
            <ButtonGroup marginLeft={[1, 2, "2em"]} orientation={buttonOrientation || 'horizontal'}>
              <IconButton aria-label={t`Edit`} color="gray.600" icon={<EditIcon />} as={NextLink} href={`/decks/edit/${deck.id}`} />
              <IconButton aria-label={t`Delete`} color="red.400" icon={<DeleteIcon />} onClick={doDelete} />
            </ButtonGroup>
          )}
        </Flex>
      </Flex>
    </ListItem>
  );
}
export default function DeckList({
  roleCards,
  decks,
  onDelete,
}: {
  decks: DeckWithCampaignFragment[] | undefined;
  roleCards: CardsMap;
  onDelete: (deck: DeckFragment) => void;
}) {
  if (!decks?.length) {
    return <Text>{t`You don't seem to have any decks.`}</Text>
  }
  return (
    <List>
      { map(decks, deck => (
        <DeckRow
          key={deck.id}
          deck={deck}
          roleCards={roleCards}
          onDelete={onDelete}
        />
      )) }
    </List>
  );
}