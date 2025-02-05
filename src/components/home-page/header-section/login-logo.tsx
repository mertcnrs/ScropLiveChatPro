import React from 'react';
import { Box } from '@radix-ui/themes';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginLogoComponent(): React.ReactNode {
  return (
    <Box>
      <div className="hidden lg:block">
        <Link href="/">
          <Image
            src={'/ranchat-main.png'}
            alt="ranchat-main"
            width={'160'}
            height={'160'}
            className="object-contain cursor-pointer"
          />
        </Link>
      </div>
      <div className="block lg:hidden">
        <Link href="/">
          <Image
            src={'/ranchat-logo.png'}
            alt="ranchat-logo"
            width={'40'}
            height={'40'}
            className="object-contain cursor-pointer"
          />
        </Link>
      </div>
      {/* <Button radius={'small'}>Login</Button> */}
      {/* <Button radius={'small'}>Register</Button> */}
    </Box>
  );
}
