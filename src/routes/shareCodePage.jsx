import React from 'react'
import { useUser } from '../context/UserContext'
import ShareCodeInput from '../components/ShareCodeInput';
import { useMediaBreakpoints } from '../../utils/hooks/media';

const ShareCodePage = () => {

    const {user, authLoading} = useUser();
    const { isTabletOrMobile } = useMediaBreakpoints();

  return (
    <div style={{width: isTabletOrMobile ? '90vw' : 400}}>
        <h2>Enter your share code below to add a shared Album</h2>
        {
            authLoading ? <div>Loading</div> : 
            <div>
                <ShareCodeInput user={user} />
            </div>
        }
    </div>
  )
}

export default ShareCodePage
