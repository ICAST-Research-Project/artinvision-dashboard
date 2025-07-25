// import { useSession } from "next-auth/react";

// export const useCurrentUser = () => {
//   const session = useSession();

//   return session.data?.user;
// };

"use client";

import {
  getCurrentArtist,
  getCurrentCurator,
  getCurrentMuseumAdmin,
} from "@/actions/settings";
import { useEffect, useState } from "react";

export const useCurrentUser = () => {
  const [user, setUser] = useState<Awaited<
    ReturnType<typeof getCurrentMuseumAdmin>
  > | null>(null);

  useEffect(() => {
    getCurrentMuseumAdmin().then(setUser);
  }, []);

  return user;
};

export const useCurrentCuratorUser = () => {
  const [user, setUser] = useState<Awaited<
    ReturnType<typeof getCurrentCurator>
  > | null>(null);

  useEffect(() => {
    getCurrentCurator().then(setUser);
  }, []);

  return user;
};

export const useCurrentArtistUser = () => {
  const [user, setUser] = useState<Awaited<
    ReturnType<typeof getCurrentArtist>
  > | null>(null);

  useEffect(() => {
    getCurrentArtist().then(setUser);
  }, []);

  return user;
};
