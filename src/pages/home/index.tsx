import React from "react";
import { Force } from "./components/Force";
import { Pie } from "./components/Pie";
import { CoreBar } from "./components/CoreBar";
import { Controls } from "./components/Controls";


export const Home: React.FC = () => {
    return (
        <div className="flex h-full">
            <div className="w-1/6 border mx-2">
                <div> 搜索</div>
                <div className="m-2">列表</div>
            </div>
            <div className="flex-1 border mx-2">
                <div className="m-2 border">
					<Controls />
				</div>
                <div className="m-2 border">
                    <Force />
                </div>
            </div>
            <div className="w-1/5 border mx-2">
                <div className="m-2 border">
					<Pie />
				</div>
                <div className="m-2 border">
					<CoreBar />
				</div>
            </div>
        </div>
    );
};
