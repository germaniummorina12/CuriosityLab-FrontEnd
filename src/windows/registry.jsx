import {
  ExcelIcon,
  MyComputerIcon,
  RecycleBinIcon,
  InternetExplorerIcon,
  ChromeIcon,
  MinesweeperIcon,
  SolitaireIcon,
  FreeCellIcon,
  HeartsIcon,
  SpiderSolitaireIcon,
  PaintIcon,
  MyDocumentsIcon,
  ControlPanelIcon,
  HelpIcon,
  UserTileIcon,
} from '../components/icons/RetroIcons'
import MyComputerWindow from './MyComputerWindow'
import UsersSheet from './UsersSheet'
import RolesSheet from './RolesSheet'
import AddressesSheet from './AddressesSheet'
import ContactsSheet from './ContactsSheet'
import RecycleBinWindow from './RecycleBinWindow'
import UserProfileWindow from './UserProfileWindow'
import NewUserWindow from './NewUserWindow'
import EditUserWindow from './EditUserWindow'
import FindUsersWindow from './FindUsersWindow'
import NewRoleWindow from './NewRoleWindow'
import EditRoleWindow from './EditRoleWindow'
import RoleProfileWindow from './RoleProfileWindow'
import RoleReportsWindow from './RoleReportsWindow'
import NewAddressWindow from './NewAddressWindow'
import EditAddressWindow from './EditAddressWindow'
import AddressReportsWindow from './AddressReportsWindow'
import NewContactWindow from './NewContactWindow'
import EditContactWindow from './EditContactWindow'
import ContactsForUserWindow from './ContactsForUserWindow'
import ContactReportsWindow from './ContactReportsWindow'
import BrowserWindow from './BrowserWindow'
import Minesweeper from './games/Minesweeper'
import Solitaire from './games/Solitaire'
import FreeCell from './games/FreeCell'
import Hearts from './games/Hearts'
import SpiderSolitaire from './games/SpiderSolitaire'
import Paint from './Paint'
import MyDocumentsWindow from './MyDocumentsWindow'
import ControlPanelWindow from './ControlPanelWindow'
import HelpWindow from './HelpWindow'

const InternetExplorerWindow = () => <BrowserWindow browser="ie" />
const ChromeWindow = () => <BrowserWindow browser="chrome" />

export const registry = {
  dashboard: { title: 'My Computer', icon: MyComputerIcon, Component: MyComputerWindow, width: 680, height: 480 },
  users: { title: 'UserList.xls', icon: ExcelIcon, Component: UsersSheet, width: 680, height: 460 },
  roles: { title: 'RoleList.xls', icon: ExcelIcon, Component: RolesSheet, width: 480, height: 420 },
  addresses: { title: 'AddressBook.xls', icon: ExcelIcon, Component: AddressesSheet, width: 620, height: 440 },
  contacts: { title: 'ContactList.xls', icon: ExcelIcon, Component: ContactsSheet, width: 560, height: 420 },
  'recycle-bin': { title: 'Recycle Bin', icon: RecycleBinIcon, Component: RecycleBinWindow, width: 580, height: 420 },
  'user-profile': { title: 'User Properties', icon: UserTileIcon, Component: UserProfileWindow, width: 420, height: 460 },
  'new-user': { title: 'New User', icon: UserTileIcon, Component: NewUserWindow, width: 360, height: 300 },
  'edit-user': { title: 'Edit User', icon: UserTileIcon, Component: EditUserWindow, width: 360, height: 300 },
  'find-users': { title: 'Find Users', icon: UserTileIcon, Component: FindUsersWindow, width: 580, height: 460 },
  'new-role': { title: 'New Role', icon: ExcelIcon, Component: NewRoleWindow, width: 340, height: 220 },
  'edit-role': { title: 'Edit Role', icon: ExcelIcon, Component: EditRoleWindow, width: 360, height: 240 },
  'role-profile': { title: 'Role Properties', icon: ExcelIcon, Component: RoleProfileWindow, width: 420, height: 440 },
  'role-reports': { title: 'Role Reports', icon: ExcelIcon, Component: RoleReportsWindow, width: 540, height: 420 },
  'new-address': { title: 'New Address', icon: ExcelIcon, Component: NewAddressWindow, width: 360, height: 360 },
  'edit-address': { title: 'Edit Address', icon: ExcelIcon, Component: EditAddressWindow, width: 340, height: 280 },
  'address-reports': { title: 'Address Reports', icon: ExcelIcon, Component: AddressReportsWindow, width: 600, height: 460 },
  'new-contact': { title: 'New Contact', icon: ExcelIcon, Component: NewContactWindow, width: 360, height: 320 },
  'edit-contact': { title: 'Edit Contact', icon: ExcelIcon, Component: EditContactWindow, width: 360, height: 300 },
  'contacts-for-user': { title: 'Manage Contacts', icon: ExcelIcon, Component: ContactsForUserWindow, width: 480, height: 420 },
  'contact-reports': { title: 'Contact Reports', icon: ExcelIcon, Component: ContactReportsWindow, width: 600, height: 460 },
  'internet-explorer': { title: 'Internet Explorer', icon: InternetExplorerIcon, Component: InternetExplorerWindow, width: 640, height: 480 },
  chrome: { title: 'Google Chrome', icon: ChromeIcon, Component: ChromeWindow, width: 640, height: 480 },
  minesweeper: { title: 'Minesweeper', icon: MinesweeperIcon, Component: Minesweeper, width: 260, height: 400, maximized: true },
  solitaire: { title: 'Solitaire', icon: SolitaireIcon, Component: Solitaire, width: 490, height: 560 },
  freecell: { title: 'FreeCell', icon: FreeCellIcon, Component: FreeCell, width: 550, height: 560 },
  hearts: { title: 'Hearts', icon: HeartsIcon, Component: Hearts, width: 420, height: 480 },
  'spider-solitaire': { title: 'Spider Solitaire', icon: SpiderSolitaireIcon, Component: SpiderSolitaire, width: 660, height: 600 },
  paint: { title: 'untitled - Paint', icon: PaintIcon, Component: Paint, width: 500, height: 420 },
  'my-documents': { title: 'My Documents', icon: MyDocumentsIcon, Component: MyDocumentsWindow, width: 380, height: 360 },
  'control-panel': { title: 'Control Panel', icon: ControlPanelIcon, Component: ControlPanelWindow, width: 460, height: 460 },
  help: { title: 'Help and Support', icon: HelpIcon, Component: HelpWindow, width: 420, height: 420 },
}
