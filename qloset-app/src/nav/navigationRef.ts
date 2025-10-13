// src/nav/navigationRef.ts
import {
  createNavigationContainerRef,
  StackActions,
  NavigationContainerRef,
} from "@react-navigation/native";

type RootStackParamList = Record<string, object | undefined>;

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: keyof RootStackParamList, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

// optional helper to push new route
export function push(name: keyof RootStackParamList, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name, params));
  }
}
