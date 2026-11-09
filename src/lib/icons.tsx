// The app's icon set: Remix Icon behind the names the code imports from "lucide-react".
//
// Remix Icon (https://remixicon.com) is Apache-2.0, the same license as this repository. Every component keeps the
// lucide contract the call sites rely on — the size prop, currentColor, and the "lucide lucide-<name>" class names that
// styles and tests select — so only the drawing changes.
import type { ComponentType, SVGProps } from "react";
import type { RemixiconComponentType } from "@remixicon/react";
import {
  RiAccountCircleLine,
  RiAddLine,
  RiAlertLine,
  RiArchiveLine,
  RiArrowDownLine,
  RiArrowDownSLine,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiArrowLeftLine,
  RiArrowLeftRightLine,
  RiArrowLeftSLine,
  RiArrowRightLine,
  RiArrowRightSLine,
  RiArrowRightUpLine,
  RiArrowUpLine,
  RiArrowUpSLine,
  RiArticleLine,
  RiAtLine,
  RiAtomLine,
  RiAttachmentLine,
  RiAwardLine,
  RiBankCardLine,
  RiBarChartLine,
  RiBookLine,
  RiBookOpenLine,
  RiBookShelfLine,
  RiBookletLine,
  RiBookmarkLine,
  RiBox3Line,
  RiBrainLine,
  RiBriefcaseLine,
  RiBugLine,
  RiBuildingLine,
  RiCakeLine,
  RiCalendarCheckLine,
  RiCalendarEventLine,
  RiCalendarLine,
  RiChat1Line,
  RiChat3Line,
  RiChat4Line,
  RiChatNewLine,
  RiCheckDoubleLine,
  RiCheckLine,
  RiCheckboxCircleLine,
  RiCircleFill,
  RiCircleLine,
  RiClipboardLine,
  RiCloseCircleLine,
  RiCloseLine,
  RiCloudLine,
  RiCloudOffLine,
  RiCodeBoxLine,
  RiCodeLine,
  RiCodeSSlashLine,
  RiCoinsLine,
  RiCompassLine,
  RiComputerLine,
  RiContactsLine,
  RiContractLeftLine,
  RiCornerDownRightLine,
  RiCornerUpLeftLine,
  RiCpuLine,
  RiCrosshairLine,
  RiCursorLine,
  RiDashboardLine,
  RiDatabase2Line,
  RiDeleteBinLine,
  RiDoubleQuotesL,
  RiDownloadCloud2Line,
  RiDownloadLine,
  RiDraftLine,
  RiDraggable,
  RiEditLine,
  RiEmotionAddLine,
  RiEqualizerLine,
  RiErrorWarningLine,
  RiExpandUpDownLine,
  RiExternalLinkLine,
  RiEyeLine,
  RiEyeOffLine,
  RiFileCopyLine,
  RiFileEditLine,
  RiFileLine,
  RiFileListLine,
  RiFileTextLine,
  RiFileUploadLine,
  RiFilmLine,
  RiFilter3Line,
  RiFingerprintLine,
  RiFlashlightLine,
  RiFlaskLine,
  RiFocus3Line,
  RiFolderAddLine,
  RiFolderLine,
  RiFolderOpenLine,
  RiFolderReduceLine,
  RiFolderTransferLine,
  RiFontSize,
  RiForbidLine,
  RiFullscreenExitLine,
  RiFullscreenLine,
  RiGiftLine,
  RiGitBranchLine,
  RiGitCommitLine,
  RiGitMergeLine,
  RiGitPullRequestLine,
  RiGithubLine,
  RiGlobalLine,
  RiGraduationCapLine,
  RiGroupLine,
  RiHand,
  RiHandHeartLine,
  RiHardDrive2Line,
  RiHashtag,
  RiHistoryLine,
  RiHomeLine,
  RiHourglassLine,
  RiImage2Line,
  RiImageAddLine,
  RiImageLine,
  RiInboxLine,
  RiInboxUnarchiveLine,
  RiInformationLine,
  RiKeyLine,
  RiKeyboardLine,
  RiLayoutColumnLine,
  RiLayoutGridLine,
  RiLayoutLine,
  RiLifebuoyLine,
  RiLightbulbLine,
  RiLineChartLine,
  RiLink,
  RiLinkUnlink,
  RiListCheck,
  RiLoader4Line,
  RiLockLine,
  RiLoginBoxLine,
  RiLogoutBoxRLine,
  RiMacbookLine,
  RiMagicLine,
  RiMailLine,
  RiMapLine,
  RiMapPinLine,
  RiMenuLine,
  RiMicLine,
  RiMicOffLine,
  RiMoonLine,
  RiMore2Line,
  RiMoreLine,
  RiMusicLine,
  RiNewspaperLine,
  RiNodeTree,
  RiNotification3Line,
  RiNotificationBadgeLine,
  RiNotificationOffLine,
  RiOpenArmLine,
  RiPaletteLine,
  RiPauseLine,
  RiPencilLine,
  RiPhoneLine,
  RiPlayLine,
  RiPlugLine,
  RiPriceTag3Line,
  RiProfileLine,
  RiPulseLine,
  RiPushpinLine,
  RiPuzzleLine,
  RiQrCodeLine,
  RiQuestionLine,
  RiRadioButtonLine,
  RiRefreshLine,
  RiRepeat2Line,
  RiRepeatLine,
  RiReplyLine,
  RiRobot2Line,
  RiRocketLine,
  RiSaveLine,
  RiSearchLine,
  RiSendPlaneLine,
  RiServerLine,
  RiSettings3Line,
  RiShareForwardLine,
  RiShareLine,
  RiShieldCheckLine,
  RiShieldLine,
  RiShutDownLine,
  RiSignalTowerLine,
  RiSlackLine,
  RiSmartphoneLine,
  RiSparklingLine,
  RiSplitCellsHorizontal,
  RiSquareLine,
  RiStackLine,
  RiStarLine,
  RiSubtractLine,
  RiTableLine,
  RiTabletLine,
  RiTeamLine,
  RiTerminalBoxLine,
  RiTerminalLine,
  RiTextWrap,
  RiTimeLine,
  RiTimerLine,
  RiToggleLine,
  RiToolsLine,
  RiUnpinLine,
  RiUploadCloud2Line,
  RiUploadLine,
  RiUsbLine,
  RiUserAddLine,
  RiUserLine,
  RiVideoLine,
  RiVipCrownLine,
  RiVoiceprintLine,
  RiVolumeUpLine,
  RiWalletLine,
  RiWebhookLine,
  RiWifiLine,
  RiWindowLine,
  RiZoomInLine,
} from "@remixicon/react";

export type LucideProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
};

export type LucideIcon = ComponentType<LucideProps>;

const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

function icon(Drawing: RemixiconComponentType, name: string): LucideIcon {
  const base = `lucide lucide-${kebab(name)}`;
  // Remix's props reserve children and forward the rest of SVGProps unchanged.
  const Draw = Drawing as unknown as ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;
  return function Icon({ size = 24, className, ...rest }: LucideProps) {
    return <Draw size={size} className={className ? `${base} ${className}` : base} {...rest} />;
  };
}

export const Activity = icon(RiPulseLine, "Activity");
export const AlertTriangle = icon(RiErrorWarningLine, "AlertTriangle");
export const AppWindow = icon(RiWindowLine, "AppWindow");
export const Archive = icon(RiArchiveLine, "Archive");
export const ArchiveRestore = icon(RiInboxUnarchiveLine, "ArchiveRestore");
export const ArrowDown = icon(RiArrowDownLine, "ArrowDown");
export const ArrowDownToLine = icon(RiDownloadLine, "ArrowDownToLine");
export const ArrowLeft = icon(RiArrowLeftLine, "ArrowLeft");
export const ArrowLeftRight = icon(RiArrowLeftRightLine, "ArrowLeftRight");
export const ArrowRight = icon(RiArrowRightLine, "ArrowRight");
export const ArrowRightLeft = icon(RiArrowLeftRightLine, "ArrowRightLeft");
export const ArrowUp = icon(RiArrowUpLine, "ArrowUp");
export const ArrowUpRight = icon(RiArrowRightUpLine, "ArrowUpRight");
export const Atom = icon(RiAtomLine, "Atom");
export const AtSign = icon(RiAtLine, "AtSign");
export const AudioLines = icon(RiVoiceprintLine, "AudioLines");
export const Award = icon(RiAwardLine, "Award");
export const Bell = icon(RiNotification3Line, "Bell");
export const BellDot = icon(RiNotificationBadgeLine, "BellDot");
export const BellOff = icon(RiNotificationOffLine, "BellOff");
export const Blocks = icon(RiLayoutGridLine, "Blocks");
export const Book = icon(RiBookLine, "Book");
export const BookmarkPlus = icon(RiBookmarkLine, "BookmarkPlus");
export const BookOpen = icon(RiBookOpenLine, "BookOpen");
export const Bot = icon(RiRobot2Line, "Bot");
export const Box = icon(RiBox3Line, "Box");
export const Brain = icon(RiBrainLine, "Brain");
export const Briefcase = icon(RiBriefcaseLine, "Briefcase");
export const Bug = icon(RiBugLine, "Bug");
export const Building2 = icon(RiBuildingLine, "Building2");
export const Calendar = icon(RiCalendarLine, "Calendar");
export const CalendarCheck = icon(RiCalendarCheckLine, "CalendarCheck");
export const CalendarClock = icon(RiCalendarLine, "CalendarClock");
export const CalendarDays = icon(RiCalendarLine, "CalendarDays");
export const CalendarPlus = icon(RiCalendarEventLine, "CalendarPlus");
export const ChartColumn = icon(RiBarChartLine, "ChartColumn");
export const ChartNoAxesCombined = icon(RiLineChartLine, "ChartNoAxesCombined");
export const Check = icon(RiCheckLine, "Check");
export const CheckCheck = icon(RiCheckDoubleLine, "CheckCheck");
export const CheckCircle2 = icon(RiCheckboxCircleLine, "CheckCircle2");
export const ChevronDown = icon(RiArrowDownSLine, "ChevronDown");
export const ChevronLeft = icon(RiArrowLeftSLine, "ChevronLeft");
export const ChevronRight = icon(RiArrowRightSLine, "ChevronRight");
export const ChevronsUpDown = icon(RiExpandUpDownLine, "ChevronsUpDown");
export const ChevronUp = icon(RiArrowUpSLine, "ChevronUp");
export const Circle = icon(RiCircleLine, "Circle");
export const CircleAlert = icon(RiAlertLine, "CircleAlert");
export const CircleCheck = icon(RiCheckboxCircleLine, "CircleCheck");
export const CircleCheckBig = icon(RiCheckboxCircleLine, "CircleCheckBig");
export const CircleDot = icon(RiRadioButtonLine, "CircleDot");
export const CircleHelp = icon(RiQuestionLine, "CircleHelp");
export const CircleUserRound = icon(RiAccountCircleLine, "CircleUserRound");
export const Clipboard = icon(RiClipboardLine, "Clipboard");
export const ClipboardCopy = icon(RiFileCopyLine, "ClipboardCopy");
export const ClipboardList = icon(RiFileListLine, "ClipboardList");
export const ClipboardPaste = icon(RiClipboardLine, "ClipboardPaste");
export const Clock = icon(RiTimeLine, "Clock");
export const Clock3 = icon(RiTimeLine, "Clock3");
export const Cloud = icon(RiCloudLine, "Cloud");
export const CloudAlert = icon(RiCloudLine, "CloudAlert");
export const CloudCheck = icon(RiCloudLine, "CloudCheck");
export const CloudDownload = icon(RiDownloadCloud2Line, "CloudDownload");
export const CloudOff = icon(RiCloudOffLine, "CloudOff");
export const CloudUpload = icon(RiUploadCloud2Line, "CloudUpload");
export const Code = icon(RiCodeLine, "Code");
export const Code2 = icon(RiCodeSSlashLine, "Code2");
export const Coins = icon(RiCoinsLine, "Coins");
export const Columns2 = icon(RiLayoutColumnLine, "Columns2");
export const Columns3 = icon(RiLayoutColumnLine, "Columns3");
export const Compass = icon(RiCompassLine, "Compass");
export const Contact = icon(RiContactsLine, "Contact");
export const Copy = icon(RiFileCopyLine, "Copy");
export const CornerDownRight = icon(RiCornerDownRightLine, "CornerDownRight");
export const CornerUpLeft = icon(RiCornerUpLeftLine, "CornerUpLeft");
export const Cpu = icon(RiCpuLine, "Cpu");
export const CreditCard = icon(RiBankCardLine, "CreditCard");
export const Crosshair = icon(RiCrosshairLine, "Crosshair");
export const Crown = icon(RiVipCrownLine, "Crown");
export const Database = icon(RiDatabase2Line, "Database");
export const Dot = icon(RiCircleFill, "Dot");
export const Download = icon(RiDownloadLine, "Download");
export const Ellipsis = icon(RiMoreLine, "Ellipsis");
export const EllipsisVertical = icon(RiMore2Line, "EllipsisVertical");
export const ExternalLink = icon(RiExternalLinkLine, "ExternalLink");
export const Eye = icon(RiEyeLine, "Eye");
export const EyeOff = icon(RiEyeOffLine, "EyeOff");
export const File = icon(RiFileLine, "File");
export const FileIcon = icon(RiFileLine, "FileIcon");
export const FilePen = icon(RiFileEditLine, "FilePen");
export const FileText = icon(RiFileTextLine, "FileText");
export const FileUp = icon(RiFileUploadLine, "FileUp");
export const Film = icon(RiFilmLine, "Film");
export const Fingerprint = icon(RiFingerprintLine, "Fingerprint");
export const FlaskConical = icon(RiFlaskLine, "FlaskConical");
export const Folder = icon(RiFolderLine, "Folder");
export const FolderInput = icon(RiFolderTransferLine, "FolderInput");
export const FolderMinus = icon(RiFolderReduceLine, "FolderMinus");
export const FolderOpen = icon(RiFolderOpenLine, "FolderOpen");
export const FolderPlus = icon(RiFolderAddLine, "FolderPlus");
export const Gauge = icon(RiDashboardLine, "Gauge");
export const Gift = icon(RiGiftLine, "Gift");
export const GitBranch = icon(RiGitBranchLine, "GitBranch");
export const GitCommitHorizontal = icon(RiGitCommitLine, "GitCommitHorizontal");
export const Github = icon(RiGithubLine, "Github");
export const GitPullRequest = icon(RiGitPullRequestLine, "GitPullRequest");
export const Globe = icon(RiGlobalLine, "Globe");
export const GraduationCap = icon(RiGraduationCapLine, "GraduationCap");
export const GripVertical = icon(RiDraggable, "GripVertical");
export const Hand = icon(RiHand, "Hand");
export const HandHelping = icon(RiHandHeartLine, "HandHelping");
export const HardDrive = icon(RiHardDrive2Line, "HardDrive");
export const Hash = icon(RiHashtag, "Hash");
export const HelpCircle = icon(RiQuestionLine, "HelpCircle");
export const History = icon(RiHistoryLine, "History");
export const Hourglass = icon(RiHourglassLine, "Hourglass");
export const House = icon(RiHomeLine, "House");
export const IdCard = icon(RiProfileLine, "IdCard");
export const Image = icon(RiImageLine, "Image");
export const ImageIcon = icon(RiImageLine, "ImageIcon");
export const ImageOff = icon(RiImageLine, "ImageOff");
export const ImagePlus = icon(RiImageAddLine, "ImagePlus");
export const Images = icon(RiImage2Line, "Images");
export const Inbox = icon(RiInboxLine, "Inbox");
export const Info = icon(RiInformationLine, "Info");
export const Keyboard = icon(RiKeyboardLine, "Keyboard");
export const KeyRound = icon(RiKeyLine, "KeyRound");
export const Laptop = icon(RiMacbookLine, "Laptop");
export const Layers = icon(RiStackLine, "Layers");
export const LayoutDashboard = icon(RiDashboardLine, "LayoutDashboard");
export const LayoutGrid = icon(RiLayoutGridLine, "LayoutGrid");
export const LayoutTemplate = icon(RiLayoutLine, "LayoutTemplate");
export const Library = icon(RiBookShelfLine, "Library");
export const LifeBuoy = icon(RiLifebuoyLine, "LifeBuoy");
export const Lightbulb = icon(RiLightbulbLine, "Lightbulb");
export const Link2 = icon(RiLink, "Link2");
export const Link2Off = icon(RiLinkUnlink, "Link2Off");
export const LinkIcon = icon(RiLink, "LinkIcon");
export const ListChecks = icon(RiListCheck, "ListChecks");
export const ListFilter = icon(RiFilter3Line, "ListFilter");
export const Loader2 = icon(RiLoader4Line, "Loader2");
export const LoaderCircle = icon(RiLoader4Line, "LoaderCircle");
export const Lock = icon(RiLockLine, "Lock");
export const LockIcon = icon(RiLockLine, "LockIcon");
export const LockKeyhole = icon(RiLockLine, "LockKeyhole");
export const LogIn = icon(RiLoginBoxLine, "LogIn");
export const LogOut = icon(RiLogoutBoxRLine, "LogOut");
export const Mail = icon(RiMailLine, "Mail");
export const MapIcon = icon(RiMapLine, "MapIcon");
export const MapPin = icon(RiMapPinLine, "MapPin");
export const Maximize = icon(RiFullscreenLine, "Maximize");
export const Maximize2 = icon(RiFullscreenLine, "Maximize2");
export const Menu = icon(RiMenuLine, "Menu");
export const Merge = icon(RiGitMergeLine, "Merge");
export const MessageCircle = icon(RiChat3Line, "MessageCircle");
export const MessageSquare = icon(RiChat1Line, "MessageSquare");
export const MessageSquarePlus = icon(RiChatNewLine, "MessageSquarePlus");
export const MessageSquareText = icon(RiChat1Line, "MessageSquareText");
export const MessagesSquare = icon(RiChat4Line, "MessagesSquare");
export const Mic = icon(RiMicLine, "Mic");
export const MicOff = icon(RiMicOffLine, "MicOff");
export const Minimize = icon(RiFullscreenExitLine, "Minimize");
export const Minimize2 = icon(RiFullscreenExitLine, "Minimize2");
export const Minus = icon(RiSubtractLine, "Minus");
export const Monitor = icon(RiComputerLine, "Monitor");
export const MonitorCog = icon(RiComputerLine, "MonitorCog");
export const MonitorOff = icon(RiComputerLine, "MonitorOff");
export const MonitorX = icon(RiComputerLine, "MonitorX");
export const Moon = icon(RiMoonLine, "Moon");
export const MoreHorizontal = icon(RiMoreLine, "MoreHorizontal");
export const MousePointer2 = icon(RiCursorLine, "MousePointer2");
export const Music = icon(RiMusicLine, "Music");
export const Network = icon(RiNodeTree, "Network");
export const Newspaper = icon(RiNewspaperLine, "Newspaper");
export const Notebook = icon(RiBookletLine, "Notebook");
export const NotebookPen = icon(RiDraftLine, "NotebookPen");
export const PackageOpen = icon(RiOpenArmLine, "PackageOpen");
export const Palette = icon(RiPaletteLine, "Palette");
export const Paperclip = icon(RiAttachmentLine, "Paperclip");
export const PartyPopper = icon(RiCakeLine, "PartyPopper");
export const Pause = icon(RiPauseLine, "Pause");
export const Pencil = icon(RiPencilLine, "Pencil");
export const PencilLine = icon(RiPencilLine, "PencilLine");
export const Phone = icon(RiPhoneLine, "Phone");
export const PhoneCall = icon(RiPhoneLine, "PhoneCall");
export const PhoneOff = icon(RiPhoneLine, "PhoneOff");
export const Pin = icon(RiPushpinLine, "Pin");
export const PinOff = icon(RiUnpinLine, "PinOff");
export const Play = icon(RiPlayLine, "Play");
export const Plug = icon(RiPlugLine, "Plug");
export const PlugZap = icon(RiPlugLine, "PlugZap");
export const Plus = icon(RiAddLine, "Plus");
export const Power = icon(RiShutDownLine, "Power");
export const Puzzle = icon(RiPuzzleLine, "Puzzle");
export const QrCode = icon(RiQrCodeLine, "QrCode");
export const Quote = icon(RiDoubleQuotesL, "Quote");
export const RadioTower = icon(RiSignalTowerLine, "RadioTower");
export const RefreshCw = icon(RiRefreshLine, "RefreshCw");
export const Repeat = icon(RiRepeatLine, "Repeat");
export const Repeat2 = icon(RiRepeat2Line, "Repeat2");
export const Reply = icon(RiReplyLine, "Reply");
export const Rocket = icon(RiRocketLine, "Rocket");
export const RotateCcw = icon(RiArrowGoBackLine, "RotateCcw");
export const RotateCw = icon(RiArrowGoForwardLine, "RotateCw");
export const Save = icon(RiSaveLine, "Save");
export const ScrollText = icon(RiArticleLine, "ScrollText");
export const Search = icon(RiSearchLine, "Search");
export const Send = icon(RiSendPlaneLine, "Send");
export const Server = icon(RiServerLine, "Server");
export const ServerCog = icon(RiServerLine, "ServerCog");
export const Settings = icon(RiSettings3Line, "Settings");
export const Share = icon(RiShareLine, "Share");
export const Share2 = icon(RiShareForwardLine, "Share2");
export const Shield = icon(RiShieldLine, "Shield");
export const ShieldAlert = icon(RiShieldLine, "ShieldAlert");
export const ShieldCheck = icon(RiShieldCheckLine, "ShieldCheck");
export const Shrink = icon(RiContractLeftLine, "Shrink");
export const Slack = icon(RiSlackLine, "Slack");
export const SlidersHorizontal = icon(RiEqualizerLine, "SlidersHorizontal");
export const Smartphone = icon(RiSmartphoneLine, "Smartphone");
export const SmilePlus = icon(RiEmotionAddLine, "SmilePlus");
export const Sparkle = icon(RiSparklingLine, "Sparkle");
export const Sparkles = icon(RiSparklingLine, "Sparkles");
export const Split = icon(RiSplitCellsHorizontal, "Split");
export const Square = icon(RiSquareLine, "Square");
export const SquareCode = icon(RiCodeBoxLine, "SquareCode");
export const SquareMenu = icon(RiMenuLine, "SquareMenu");
export const SquarePen = icon(RiEditLine, "SquarePen");
export const SquareSlash = icon(RiForbidLine, "SquareSlash");
export const SquareTerminal = icon(RiTerminalBoxLine, "SquareTerminal");
export const Star = icon(RiStarLine, "Star");
export const Table2 = icon(RiTableLine, "Table2");
export const TabletSmartphone = icon(RiTabletLine, "TabletSmartphone");
export const Tag = icon(RiPriceTag3Line, "Tag");
export const Target = icon(RiFocus3Line, "Target");
export const Terminal = icon(RiTerminalLine, "Terminal");
export const TerminalSquare = icon(RiTerminalBoxLine, "TerminalSquare");
export const TextQuote = icon(RiDoubleQuotesL, "TextQuote");
export const Timer = icon(RiTimerLine, "Timer");
export const ToggleLeft = icon(RiToggleLine, "ToggleLeft");
export const Trash2 = icon(RiDeleteBinLine, "Trash2");
export const TriangleAlert = icon(RiErrorWarningLine, "TriangleAlert");
export const Type = icon(RiFontSize, "Type");
export const Undo2 = icon(RiArrowGoBackLine, "Undo2");
export const Unplug = icon(RiPlugLine, "Unplug");
export const Upload = icon(RiUploadLine, "Upload");
export const UploadCloud = icon(RiUploadCloud2Line, "UploadCloud");
export const Usb = icon(RiUsbLine, "Usb");
export const User = icon(RiUserLine, "User");
export const UserPlus = icon(RiUserAddLine, "UserPlus");
export const UserRound = icon(RiUserLine, "UserRound");
export const UserRoundPlus = icon(RiUserAddLine, "UserRoundPlus");
export const Users = icon(RiGroupLine, "Users");
export const UsersRound = icon(RiTeamLine, "UsersRound");
export const Video = icon(RiVideoLine, "Video");
export const Volume2 = icon(RiVolumeUpLine, "Volume2");
export const Wallet = icon(RiWalletLine, "Wallet");
export const Wand2 = icon(RiMagicLine, "Wand2");
export const Webhook = icon(RiWebhookLine, "Webhook");
export const Wifi = icon(RiWifiLine, "Wifi");
export const WrapText = icon(RiTextWrap, "WrapText");
export const Wrench = icon(RiToolsLine, "Wrench");
export const X = icon(RiCloseLine, "X");
export const XCircle = icon(RiCloseCircleLine, "XCircle");
export const Zap = icon(RiFlashlightLine, "Zap");
export const ZoomIn = icon(RiZoomInLine, "ZoomIn");
