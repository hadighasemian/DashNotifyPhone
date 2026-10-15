//  Profile Data
import i18n from "@/utils/i18n";

interface MiniiconsType {
  id: number;
  icon: string;
  tooltip: string;
}

const Miniicons: MiniiconsType[] = [
  {
    id: 1,
    icon: "solar:layers-line-duotone",
    tooltip: "Dashboards",
  },
  {
    id: 2,
    icon: "solar:database-line-duotone",
    tooltip: "Data Pages",
  },
  // {
  //   id: 3,
  //   icon: "solar:palette-round-line-duotone",
  //   tooltip: "Ui Components",
  // },

];

export default Miniicons;
