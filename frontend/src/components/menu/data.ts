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
        url: '/Simulations',
        icon: HiCalculator ,
        label: 'Analysis',
      },
      {
        isLink: true,
        url: '/View_Data',
        icon: HiChatBubbleLeftEllipsis ,
        label: 'Data',
      },
      {
        isLink: true,
        url: '/Ranker',
        icon: HiMiniWrenchScrewdriver ,
        label: 'Ranker Settings',
      },
    ],
  }
];
