/*
 * All store content in one place. Replace the placeholder values below with real data;
 * nothing else in the code needs to change.
 *
 * Product `image`: path to a photo (e.g. "assets/products/nt1.webp"). Leave null to show
 * a drawn silhouette chosen by `shape`: condenser | broadcast | shotgun | wireless | usb | headphones.
 */
window.STORE = {
  name: "صدای رود تهران",
  phone: "۰۲۱-۰۰۰۰۰۰۰۰",
  phoneHref: "+982100000000",
  mobile: "۰۹۱۲-۰۰۰-۰۰۰۰",
  address: "تهران، خیابان ولیعصر، پلاک ۰۰۰، طبقه‌ی همکف",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Tehran",
  instagram: "https://instagram.com/",
  telegram: "https://t.me/",

  // Opening hours in Tehran time. Day numbers: 0 = Sunday … 6 = Saturday.
  hours: {
    label: "شنبه تا پنجشنبه، ۱۰ تا ۲۰",
    openDays: [6, 0, 1, 2, 3, 4],
    open: 10,
    close: 20
  },

  categories: [
    { id: "mic", label: "میکروفون" },
    { id: "headphone", label: "هدفون" }
  ],

  products: [
    {
      id: "nt1-5",
      category: "mic",
      name: "NT1 5th Gen",
      shape: "condenser",
      image: null,
      use: "ضبط وکال و ساز در استودیو خانگی",
      spec: "کندانسر کاردیوئید، خروجی XLR و USB-C"
    },
    {
      id: "podmic-usb",
      category: "mic",
      name: "PodMic USB",
      shape: "broadcast",
      image: null,
      use: "پادکست و استریم با یک کابل",
      spec: "داینامیک، خروجی XLR و USB-C"
    },
    {
      id: "procaster",
      category: "mic",
      name: "Procaster",
      shape: "broadcast",
      image: null,
      use: "گویندگی و رادیو در اتاق‌های بدون آکوستیک",
      spec: "داینامیک برادکست، خروجی XLR"
    },
    {
      id: "videomic-ntg",
      category: "mic",
      name: "VideoMic NTG",
      shape: "shotgun",
      image: null,
      use: "ضبط صدا روی دوربین برای فیلم‌سازی",
      spec: "شاتگان، باتری داخلی، خروجی ۳.۵ میلی‌متری و USB-C"
    },
    {
      id: "wireless-go-2",
      category: "mic",
      name: "Wireless GO II",
      shape: "wireless",
      image: null,
      use: "مصاحبه و ولاگ با دو گوینده",
      spec: "بی‌سیم دوکاناله، برد تا ۲۰۰ متر"
    },
    {
      id: "nt-usb-plus",
      category: "mic",
      name: "NT-USB+",
      shape: "usb",
      image: null,
      use: "جلسه‌ی آنلاین، تدریس و استریم روی میز",
      spec: "کندانسر USB با پردازش صدای داخلی"
    },
    {
      id: "nth-100",
      category: "headphone",
      name: "NTH-100",
      shape: "headphones",
      image: null,
      use: "میکس و مانیتورینگ طولانی",
      spec: "بسته، پاسخ فرکانسی خطی، بالشتک خنک‌کننده"
    },
    {
      id: "nth-50",
      category: "headphone",
      name: "NTH-50",
      shape: "headphones",
      image: null,
      use: "مانیتورینگ ضبط و تدوین صدا",
      spec: "بسته، سبک، کابل جداشدنی"
    }
  ]
};
