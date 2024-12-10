import { ReactNode } from "react";
import styles from "./OutBar.module.css";

type Props = {
  fill: string;
  isLeft: boolean;
  children: ReactNode;
  onClick: any;
};

export default function OutBar({ fill, isLeft, children, onClick }: Props) {
  return (
    <div className={styles.barWrapper} style={{ fill }} onClick={onClick}>
      <div
        className={styles.bar}
        style={{ justifyContent: isLeft ? "initial" : "flex-end" }}
      >
        {children}
      </div>
      <svg height="40" width="250">
        <polygon
          points={isLeft ? "0,0 0,40 250,20" : "0,20 250,0 250,40"}
          className={styles.polygon}
        />
      </svg>
    </div>
  );
}
