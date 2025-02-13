/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useCallback, useMemo } from 'react';
import { SecurityPageName, type NavigationLink } from '@kbn/security-solution-navigation';
import { useGetLinkProps } from '@kbn/security-solution-navigation/links';
import { SolutionSideNavItemPosition } from '@kbn/security-solution-side-nav';
import { useNavLinks } from '../../common/hooks/use_nav_links';
import { ExternalPageName } from '../links/constants';
import type { ProjectSideNavItem } from './types';
import type { ProjectPageName } from '../links/types';

type GetLinkProps = (link: NavigationLink) => {
  href: string & Partial<ProjectSideNavItem>;
};

const isBottomNavItem = (id: string) =>
  id === SecurityPageName.landing ||
  id === ExternalPageName.devTools ||
  id === ExternalPageName.management ||
  id === ExternalPageName.integrationsSecurity ||
  id === ExternalPageName.cloudUsersAndRoles ||
  id === ExternalPageName.cloudPerformance ||
  id === ExternalPageName.cloudBilling;

/**
 * Formats generic navigation links into the shape expected by the `SolutionSideNav`
 */
const formatLink = (
  navLink: NavigationLink<ProjectPageName>,
  getLinkProps: GetLinkProps
): ProjectSideNavItem => {
  const items = navLink.links?.reduce<ProjectSideNavItem[]>((acc, current) => {
    if (!current.disabled) {
      acc.push({
        id: current.id,
        label: current.title,
        iconType: current.sideNavIcon,
        isBeta: current.isBeta,
        betaOptions: current.betaOptions,
        ...getLinkProps(current),
      });
    }
    return acc;
  }, []);

  return {
    id: navLink.id,
    label: navLink.title,
    iconType: navLink.sideNavIcon,
    position: isBottomNavItem(navLink.id)
      ? SolutionSideNavItemPosition.bottom
      : SolutionSideNavItemPosition.top,
    ...getLinkProps(navLink),
    ...(navLink.categories?.length && { categories: navLink.categories }),
    ...(items && { items }),
  };
};

/**
 * Returns all the formatted SideNavItems, including external links
 */
export const useSideNavItems = (): ProjectSideNavItem[] => {
  const navLinks = useNavLinks();
  const getKibanaLinkProps = useGetLinkProps();

  const getLinkProps = useCallback<GetLinkProps>(
    (link) => {
      if (link.externalUrl) {
        return {
          href: link.externalUrl,
          openInNewTab: true,
        };
      } else {
        return getKibanaLinkProps({ id: link.id });
      }
    },
    [getKibanaLinkProps]
  );

  return useMemo(
    () =>
      navLinks.reduce<ProjectSideNavItem[]>((items, navLink) => {
        if (!navLink.disabled) {
          items.push(formatLink(navLink, getLinkProps));
        }
        return items;
      }, []),
    [getLinkProps, navLinks]
  );
};
