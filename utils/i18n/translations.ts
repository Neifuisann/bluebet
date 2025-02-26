export type TranslationKey = 
  | 'home'
  | 'matches'
  | 'leaderboard'
  | 'myPredictions'
  | 'login'
  | 'register'
  | 'logout'
  | 'welcomeMessage'
  | 'predictScores'
  | 'scorePoints'
  | 'climbLeaderboard'
  | 'adminDashboard'
  | 'predictMatchScores'
  | 'competeWithFriends'
  | 'trackAccuracy'
  | 'howItWorks'
  | 'submitPredictions'
  | 'earnPoints'
  | 'compete'
  | 'signUpNow'
  | 'viewUpcomingMatches'
  | 'scoringSystem'
  | 'exactScore'
  | 'correctDifference'
  | 'correctResult'
  | 'points'
  | 'upcomingMatches'
  | 'vs'
  | 'predict'
  | 'yourPrediction'
  | 'submit'
  | 'cancel'
  | 'darkMode'
  | 'lightMode'
  | 'language'
  | 'finished'
  | 'upcoming'
  | 'all';

type Translations = {
  [key in TranslationKey]: {
    en: string;
    vi: string;
  };
};

export const translations: Translations = {
  home: {
    en: 'Home',
    vi: 'Trang chủ'
  },
  matches: {
    en: 'Matches',
    vi: 'Trận đấu'
  },
  leaderboard: {
    en: 'Leaderboard',
    vi: 'Bảng xếp hạng'
  },
  myPredictions: {
    en: 'My Predictions',
    vi: 'Dự đoán của tôi'
  },
  login: {
    en: 'Login',
    vi: 'Đăng nhập'
  },
  register: {
    en: 'Register',
    vi: 'Đăng ký'
  },
  logout: {
    en: 'Logout',
    vi: 'Đăng xuất'
  },
  welcomeMessage: {
    en: 'Welcome to Football Predictor',
    vi: 'Chào mừng đến với Dự đoán Bóng đá'
  },
  predictScores: {
    en: 'Predict Scores',
    vi: 'Dự đoán Tỷ số'
  },
  scorePoints: {
    en: 'Score Points',
    vi: 'Ghi điểm'
  },
  climbLeaderboard: {
    en: 'Climb Leaderboard',
    vi: 'Leo Bảng xếp hạng'
  },
  adminDashboard: {
    en: 'Admin Dashboard',
    vi: 'Bảng điều khiển Quản trị'
  },
  predictMatchScores: {
    en: 'Predict match scores',
    vi: 'Dự đoán tỷ số trận đấu'
  },
  competeWithFriends: {
    en: 'compete with friends',
    vi: 'cạnh tranh với bạn bè'
  },
  trackAccuracy: {
    en: 'track your prediction accuracy',
    vi: 'theo dõi độ chính xác dự đoán của bạn'
  },
  howItWorks: {
    en: 'How it works',
    vi: 'Cách thức hoạt động'
  },
  submitPredictions: {
    en: 'Submit your predictions before matches begin',
    vi: 'Gửi dự đoán của bạn trước khi trận đấu bắt đầu'
  },
  earnPoints: {
    en: 'Earn points for accurate predictions',
    vi: 'Nhận điểm cho các dự đoán chính xác'
  },
  compete: {
    en: 'Compete with others to reach the top',
    vi: 'Cạnh tranh với người khác để đạt vị trí cao nhất'
  },
  signUpNow: {
    en: 'Sign Up Now',
    vi: 'Đăng ký ngay'
  },
  viewUpcomingMatches: {
    en: 'View Upcoming Matches',
    vi: 'Xem các trận đấu sắp tới'
  },
  scoringSystem: {
    en: 'Scoring System',
    vi: 'Hệ thống tính điểm'
  },
  exactScore: {
    en: 'Exact score prediction',
    vi: 'Dự đoán tỷ số chính xác'
  },
  correctDifference: {
    en: 'Correct result and goal difference',
    vi: 'Kết quả đúng và hiệu số bàn thắng'
  },
  correctResult: {
    en: 'Correct result only',
    vi: 'Chỉ kết quả đúng'
  },
  points: {
    en: 'points',
    vi: 'điểm'
  },
  upcomingMatches: {
    en: 'Upcoming Matches',
    vi: 'Trận đấu sắp tới'
  },
  vs: {
    en: 'vs',
    vi: 'vs'
  },
  predict: {
    en: 'Predict',
    vi: 'Dự đoán'
  },
  yourPrediction: {
    en: 'Your Prediction',
    vi: 'Dự đoán của bạn'
  },
  submit: {
    en: 'Submit',
    vi: 'Gửi'
  },
  cancel: {
    en: 'Cancel',
    vi: 'Hủy'
  },
  darkMode: {
    en: 'Dark Mode',
    vi: 'Chế độ tối'
  },
  lightMode: {
    en: 'Light Mode',
    vi: 'Chế độ sáng'
  },
  language: {
    en: 'Language',
    vi: 'Ngôn ngữ'
  },
  finished: {
    en: 'Finished',
    vi: 'Đã kết thúc'
  },
  upcoming: {
    en: 'Upcoming',
    vi: 'Sắp diễn ra'
  },
  all: {
    en: 'All',
    vi: 'Tất cả'
  }
}; 