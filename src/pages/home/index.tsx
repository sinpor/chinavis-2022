import React from "react";
import { Force } from "./components/Force";
import { Pie } from "./components/Pie";
import { CoreBar } from "./components/CoreBar";
import { Controls } from "./components/Controls";
import { List } from "./components/List";
import { SearchId } from "./components/Search";


export const Home: React.FC = () => {
    return (
        <div className="flex h-full">
            <div className="w-1/6 border mx-2">
                <div className="m-2 border"> 
					<SearchId />
				</div>
                <div className="m-2 border">
					<List />
				</div>
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