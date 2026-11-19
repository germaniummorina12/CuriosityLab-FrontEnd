import { User, Folder, Settings, HelpCircle } from 'lucide-react'
import { ExcelIcon, MyComputerIcon, RecycleBinIcon, InternetExplorerIcon, ChromeIcon, MinesweeperIcon, SnakeIcon } from '../components/icons/RetroIcons'
import MyComputerWindow from './MyComputerWindow'
import UsersSheet from './UsersSheet'
import RolesSheet from './RolesSheet'
import AddressesSheet from './AddressesSheet'
import ContactsSheet from './ContactsSheet'
import RecycleBinWindow from './RecycleBinWindow'
import UserProfileWindow from './UserProfileWindow'
import BrowserWindow from './BrowserWindow'
import Minesweeper from './games/Minesweeper'
import Snake from './games/Snake'
import MyDocumentsWindow from './MyDocumentsWindow'
import ControlPanelWindow from './ControlPanelWindow'
import HelpWindow from './HelpWindow'

const InternetExplorerWindow = () => <BrowserWindow browser="ie" />
const ChromeWindow = () => <BrowserWindow browser="chrome" />

export const registry = {
  dashboard: { title: 'My Computer', icon: MyComputerIcon, Component: MyComputerWindow, width: 420, height: 440 },
  users: { title: 'UserList.xls', icon: ExcelIcon, Component: UsersSheet, width: 680, height: 460 },
  roles: { title: 'RoleList.xls', icon: ExcelIcon, Component: RolesSheet, width: 480, height: 420 },
  addresses: { title: 'AddressBook.xls', icon: ExcelIcon, Component: AddressesSheet, width: 620, height: 440 },
  contacts: { title: 'ContactList.xls', icon: ExcelIcon, Component: ContactsSheet, width: 560, height: 420 },
  'recycle-bin': { title: 'Recycle Bin', icon: RecycleBinIcon, Component: RecycleBinWindow, width: 420, height: 320 },
  'user-profile': { title: 'User Properties', icon: User, Component: UserProfileWindow, width: 420, height: 380 },
  'internet-explorer': { title: 'Internet Explorer', icon: InternetExplorerIcon, Component: InternetExplorerWindow, width: 640, height: 480 },
  chrome: { title: 'Google Chrome', icon: ChromeIcon, Component: ChromeWindow, width: 640, height: 480 },
  minesweeper: { title: 'Minesweeper', icon: MinesweeperIcon, Component: Minesweeper, width: 260, height: 400 },
  snake: { title: 'Snake', icon: SnakeIcon, Component: Snake, width: 300, height: 360 },
  'my-documents': { title: 'My Documents', icon: Folder, Component: MyDocumentsWindow, width: 380, height: 360 },
  'control-panel': { title: 'Control Panel', icon: Settings, Component: ControlPanelWindow, width: 460, height: 460 },
  help: { title: 'Help and Support', icon: HelpCircle, Component: HelpWindow, width: 420, height: 420 },
}
