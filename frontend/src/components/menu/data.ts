// import toast from 'react-hot-toast';
import {
  HiArrowTrendingUp, HiMiniWrenchScrewdriver , HiCalculator , HiChatBubbleLeftEllipsis 
} from 'react-icons/hi2';
// import { IoSettingsOutline } from 'react-icons/io5';

export const menu = [
  {
    catalog: 'Overview',
    listItems: [
      {
        isLink: true,
        url: '/',
        icon: HiArrowTrendingUp ,
        label: 'Simulations',
      },
      {
        isLink: true,
        url: '/',
        icon: HiMiniWrenchScrewdriver ,
        label: 'Ranker Settings',
      },
      {
        isLink: true,
        url: '/',
        icon: HiCalculator ,
        label: 'Agents Life',
      },
      {
        isLink: true,
        url: '/',
        icon: HiChatBubbleLeftEllipsis ,
        label: 'Data',
      },
    ],
  }
];
