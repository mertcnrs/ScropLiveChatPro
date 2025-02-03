import React from 'react';
import { Box, Button } from '@radix-ui/themes';
import Image from 'next/image';

export default function LoginLogoComponent(): React.ReactNode {
  return (
    <Box className="flex flex-row md:gap-4 md:items-center items-end mt-0 pt-0">
      <div className="hidden lg:block w-full">
        <Image
          src={'/ranchat-main.png'}
          alt="ranchat-main"
          width={'160'}
          height={'160'}
          className="object-contain"
        />
      </div>
      <div className="block lg:hidden w-full">
        <Image
          src={'/ranchat-logo.png'}
          alt="ranchat-logo"
          width={'40'}
          height={'40'}
          className="object-contain"
        />
      </div>
      {/* <Button radius={'small'}>Login</Button> */}
      {/* <Button radius={'small'}>Register</Button> */}
    </Box>
  );
}
