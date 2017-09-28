import React, {Component} from 'react';
import {Dimmer, Image, Loader} from 'semantic-ui-react'

class Callback extends Component {
    render() {

        return (
            <div>
                <Dimmer active inverted>
                    <Loader size='large'>Loading</Loader>
                </Dimmer>

                <Image src='/assets/images/wireframe/paragraph.png'/>
            </div>
        );
    }
}

export default Callback;